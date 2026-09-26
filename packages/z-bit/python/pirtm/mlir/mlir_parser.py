"""
C-01: MLIR Parser Infrastructure Fix

Robust MLIR text parser replacing the fragile regex-based _parse_mlir().

Implements a context-stack–based parser that correctly handles:
  - Nested regions (scf.for, scf.if, pirtm.module, ...)
  - SSA value definitions and uses (%0, %name, %arg0, ...)
  - Block arguments (^bb0(%arg0: type, %arg1: type):)
  - Multi-result operations (%a, %b = "op.name"(...))
  - Module-level metadata attributes (@symbol = value)
  - Operation attributes and type signatures

Mathematical anchor:
  The contractivity forward pass must walk the MLIR operation DAG correctly
  to assign ContractivityType to each SSA value. A corrupted walk (from regex
  dropping nested ops) produces unsound verification results.

Performance contract: < 100 ms for typical modules (< 1 000 lines MLIR).

Reference: ADR-008, Gate C C-01
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class MLIROperation:
    """A single MLIR operation node in the operation tree."""
    op_name: str                          # e.g. "pirtm.recurrence", "linalg.matmul"
    result_ids: List[str]                 # SSA names produced, e.g. ["0", "y"]
    operand_ids: List[str]                # SSA names consumed
    attributes: Dict[str, Any]           # parsed attribute dict (str values)
    regions: List["MLIRRegion"]          # nested regions
    source_line: int = 0                  # 1-based line number for diagnostics

    def __repr__(self) -> str:
        results = ", ".join(f"%{r}" for r in self.result_ids)
        if results:
            results += " = "
        return f"<{results}\"{self.op_name}\" at line {self.source_line}>"


@dataclass
class MLIRBlock:
    """A basic block inside a region."""
    label: str                            # e.g. "^bb0", "" for entry block
    args: List[str]                       # block-argument SSA names
    ops: List[MLIROperation] = field(default_factory=list)


@dataclass
class MLIRRegion:
    """A region containing one or more blocks."""
    blocks: List[MLIRBlock] = field(default_factory=list)


@dataclass
class MLIRModule:
    """Top-level parsed module."""
    ops: List[MLIROperation]              # top-level operations
    metadata: Dict[str, Any]             # @symbol = value pairs from pirtm.module
    ssa_graph: Dict[str, MLIROperation]  # SSA name → defining op

    def walk(self) -> List[MLIROperation]:
        """Return all operations in pre-order (outer before inner)."""
        result: List[MLIROperation] = []
        for op in self.ops:
            _collect(op, result)
        return result


def _collect(op: MLIROperation, out: List[MLIROperation]) -> None:
    out.append(op)
    for region in op.regions:
        for block in region.blocks:
            for child in block.ops:
                _collect(child, out)


# ---------------------------------------------------------------------------
# Tokeniser
# ---------------------------------------------------------------------------

# Token types
_TOK_PERCENT = "PERCENT"      # %name
_TOK_CARET   = "CARET"        # ^label
_TOK_AT      = "AT"           # @symbol
_TOK_LBRACE  = "LBRACE"       # {
_TOK_RBRACE  = "RBRACE"       # }
_TOK_LPAREN  = "LPAREN"       # (
_TOK_RPAREN  = "RPAREN"       # )
_TOK_EQ      = "EQ"           # =
_TOK_COMMA   = "COMMA"        # ,
_TOK_COLON   = "COLON"        # :
_TOK_ARROW   = "ARROW"        # ->
_TOK_STRING  = "STRING"       # "..." (op name or attribute value)
_TOK_NUMBER  = "NUMBER"       # numeric literal
_TOK_IDENT   = "IDENT"        # bare identifier / keyword
_TOK_HASH    = "HASH"         # # (attribute prefix)
_TOK_BANG    = "BANG"         # ! (type prefix)
_TOK_NEWLINE = "NEWLINE"
_TOK_EOF     = "EOF"
_TOK_OTHER   = "OTHER"        # catch-all single char

_TOKEN_RE = re.compile(
    r'(?P<COMMENT>//[^\n]*)'
    r'|(?P<PERCENT>%(?:[a-zA-Z_][a-zA-Z0-9_$]*|\d+))'
    r'|(?P<CARET>\^[a-zA-Z_][a-zA-Z0-9_$]*)'
    r'|(?P<AT>@[a-zA-Z_][a-zA-Z0-9_.]*)'
    r'|(?P<ARROW>->)'
    r'|(?P<LBRACE>\{)'
    r'|(?P<RBRACE>\})'
    r'|(?P<LPAREN>\()'
    r'|(?P<RPAREN>\))'
    r'|(?P<EQ>=)'
    r'|(?P<COMMA>,)'
    r'|(?P<COLON>:)'
    r'|(?P<HASH>#)'
    r'|(?P<BANG>!)'
    r'|(?P<STRING>"(?:[^"\\]|\\.)*")'
    r'|(?P<NUMBER>-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)'
    r'|(?P<IDENT>[a-zA-Z_][a-zA-Z0-9_.]*)'
    r'|(?P<NEWLINE>\n)'
    r'|(?P<WS>[ \t\r]+)'
    r'|(?P<OTHER>.)',
)


def _tokenise(text: str):
    """Yield (type, value, line) tuples; skip whitespace and comments."""
    line = 1
    for m in _TOKEN_RE.finditer(text):
        kind = m.lastgroup
        val = m.group()
        if kind in ("WS", "COMMENT"):
            pass
        elif kind == "NEWLINE":
            line += 1
        else:
            yield (kind, val, line)
    yield (_TOK_EOF, "", line)


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

class _Parser:
    """
    Recursive-descent MLIR text parser.

    Grammar fragment (simplified):
      module   ::= 'module' '{' op* '}'
                 | op*
      op       ::= results? '"op_name"' '(' operands? ')' attrs? regions? ':' types?
      results  ::= '%'name (',' '%'name)* '='
      regions  ::= ('{' block* '}')+
      block    ::= ('^'label ('(' block_args ')')? ':')? op*
      block_args ::= '%'name ':' type (',' '%'name ':' type)*
      attrs    ::= '{' attr_entry* '}'
      metadata ::= '@'symbol '=' value
    """

    def __init__(self, tokens):
        self._toks = list(tokens)
        self._pos = 0
        self._metadata: Dict[str, Any] = {}
        self._ssa_graph: Dict[str, MLIROperation] = {}

    # -- Token helpers ---------------------------------------------------------

    def _peek(self) -> tuple:
        if self._pos < len(self._toks):
            return self._toks[self._pos]
        return (_TOK_EOF, "", 0)

    def _peek2(self) -> tuple:
        """Peek two tokens ahead (without advancing)."""
        if self._pos + 1 < len(self._toks):
            return self._toks[self._pos + 1]
        return (_TOK_EOF, "", 0)

    def _advance(self) -> tuple:
        tok = self._peek()
        if self._pos < len(self._toks):
            self._pos += 1
        return tok

    def _expect(self, kind: str) -> tuple:
        tok = self._advance()
        if tok[0] != kind:
            raise SyntaxError(
                f"Expected {kind} but got {tok[0]}={tok[1]!r} at line {tok[2]}"
            )
        return tok

    def _match(self, kind: str, value: Optional[str] = None) -> bool:
        tok = self._peek()
        if tok[0] != kind:
            return False
        if value is not None and tok[1] != value:
            return False
        return True

    def _skip_until_rbrace(self) -> None:
        """Skip tokens until closing } (handles nesting)."""
        depth = 1
        while depth > 0:
            tok = self._advance()
            if tok[0] == _TOK_LBRACE:
                depth += 1
            elif tok[0] == _TOK_RBRACE:
                depth -= 1
            elif tok[0] == _TOK_EOF:
                break

    # -- Top-level parse -------------------------------------------------------

    def parse(self) -> MLIRModule:
        ops: List[MLIROperation] = []

        while not self._match(_TOK_EOF):
            # Handle 'module { ... }' wrapper
            if self._match(_TOK_IDENT, "module"):
                self._advance()
                if self._match(_TOK_LBRACE):
                    self._advance()
                    while not self._match(_TOK_RBRACE) and not self._match(_TOK_EOF):
                        op = self._parse_item()
                        if op is not None:
                            ops.append(op)
                    if self._match(_TOK_RBRACE):
                        self._advance()
                continue

            op = self._parse_item()
            if op is not None:
                ops.append(op)

        return MLIRModule(ops=ops, metadata=self._metadata, ssa_graph=self._ssa_graph)

    def _parse_item(self) -> Optional[MLIROperation]:
        """Parse one top-level item: metadata, operation, or block label."""
        tok = self._peek()

        # Module metadata: @symbol = value : type
        if tok[0] == _TOK_AT:
            self._parse_metadata()
            return None

        # Block label: ^bb0:  or  ^bb0(%arg0: type):
        if tok[0] == _TOK_CARET:
            self._advance()  # consume ^label
            if self._match(_TOK_LPAREN):
                self._skip_paren_group()
            if self._match(_TOK_COLON):
                self._advance()
            return None

        # Operation
        return self._parse_operation()

    def _parse_metadata(self) -> None:
        """Parse  @symbol = literal : type  metadata entry."""
        at_tok = self._advance()  # consume @symbol
        symbol = at_tok[1][1:]    # strip leading @
        if self._match(_TOK_EQ):
            self._advance()
            value = self._parse_literal_value()
            # Consume optional  : type
            if self._match(_TOK_COLON):
                self._advance()
                self._skip_type()
            self._metadata[symbol] = value

    def _parse_literal_value(self) -> Any:
        """Parse a simple literal: number, string, ident, hash-attr, bang-type."""
        tok = self._peek()
        if tok[0] == _TOK_NUMBER:
            self._advance()
            try:
                return int(tok[1])
            except ValueError:
                return float(tok[1])
        if tok[0] == _TOK_STRING:
            self._advance()
            return tok[1].strip('"')
        if tok[0] == _TOK_HASH:
            # #pirtm.unresolved_coupling etc.
            self._advance()
            parts = [tok[1]]
            if self._match(_TOK_IDENT):
                parts.append(self._advance()[1])
            return "".join(parts)
        if tok[0] == _TOK_BANG:
            self._advance()
            # !pirtm.cert(mod=7) etc.
            parts = ["!"]
            if self._match(_TOK_IDENT):
                parts.append(self._advance()[1])
            if self._match(_TOK_LPAREN):
                parts.append(self._read_balanced("(", ")"))
            return "".join(parts)
        if tok[0] == _TOK_IDENT:
            self._advance()
            return tok[1]
        return None

    def _parse_operation(self) -> Optional[MLIROperation]:
        """
        Parse a single MLIR operation.

        Forms:
          %a = "op.name"(args) {attrs} : (in_types) -> out_types
          %a, %b = "op.name"(args) {attrs} : ...
          "op.name"(args) {attrs} : ...   (no result)
          func @name(args) {regions}
          pirtm.module {regions}
        """
        tok = self._peek()
        line = tok[2]

        # Collect result SSA names before '='
        result_ids: List[str] = []
        save_pos = self._pos

        if tok[0] == _TOK_PERCENT:
            result_ids = self._try_parse_results()
            if result_ids is None:
                self._pos = save_pos
                result_ids = []

        # Operation name: either a quoted string or a dotted identifier
        op_name = self._parse_op_name()
        if op_name is None:
            # Cannot parse; skip line to avoid infinite loop
            self._skip_to_next_op()
            return None

        # Operands
        operand_ids: List[str] = []
        if self._match(_TOK_LPAREN):
            operand_ids = self._parse_operand_list()

        # Attributes block or region: use disambiguation
        attrs: Dict[str, Any] = {}
        regions: List[MLIRRegion] = []
        if self._match(_TOK_LBRACE):
            attr_dict, maybe_region = self._parse_attr_dict_or_region()
            attrs = attr_dict
            if maybe_region is not None:
                regions.append(maybe_region)

        # Additional regions (one or more  { ... })
        while self._match(_TOK_LBRACE):
            regions.append(self._parse_region())

        # Type signature  : ... -> ...  (skip for our purposes)
        if self._match(_TOK_COLON):
            self._advance()
            self._skip_type_signature()

        op = MLIROperation(
            op_name=op_name,
            result_ids=result_ids,
            operand_ids=operand_ids,
            attributes=attrs,
            regions=regions,
            source_line=line,
        )

        # Register SSA names
        for rid in result_ids:
            self._ssa_graph[rid] = op

        return op

    def _try_parse_results(self) -> Optional[List[str]]:
        """
        Try to parse  '%id, %id, ... ='  result prefix.
        Returns list of bare names, or None on failure (caller must restore pos).
        """
        ids: List[str] = []
        while self._match(_TOK_PERCENT):
            tok = self._advance()
            name = tok[1][1:]  # strip %
            ids.append(name)
            if self._match(_TOK_COMMA):
                self._advance()
            else:
                break
        if ids and self._match(_TOK_EQ):
            self._advance()
            return ids
        return None

    def _parse_op_name(self) -> Optional[str]:
        """Parse operation name: quoted string OR dotted identifier."""
        tok = self._peek()
        if tok[0] == _TOK_STRING:
            self._advance()
            return tok[1].strip('"')
        if tok[0] == _TOK_IDENT:
            parts = [self._advance()[1]]
            while self._match(_TOK_OTHER) and self._peek()[1] == ".":
                self._advance()
                if self._match(_TOK_IDENT):
                    parts.append("." + self._advance()[1])
            # Handle dotted names already captured as single IDENT token
            return parts[0]
        return None

    def _parse_operand_list(self) -> List[str]:
        """Parse '(' %a, %b, ... ')' returning bare names."""
        self._expect(_TOK_LPAREN)
        ids: List[str] = []
        while not self._match(_TOK_RPAREN) and not self._match(_TOK_EOF):
            if self._match(_TOK_PERCENT):
                tok = self._advance()
                ids.append(tok[1][1:])
            else:
                self._advance()  # skip commas, type tokens, etc.
        if self._match(_TOK_RPAREN):
            self._advance()
        return ids

    def _parse_attr_dict_or_region(self) -> Tuple[Dict[str, Any], Optional["MLIRRegion"]]:
        """
        Disambiguate between an attribute dict and a region.

        MLIR heuristic:
          - If the first non-trivial token inside '{' is '@', '%', or '^',
            it is a region (operation-containing block).
          - Otherwise it is an attribute dict.
        """
        assert self._match(_TOK_LBRACE)
        # Peek past the '{'
        save = self._pos
        self._advance()  # consume '{'
        first = self._peek()
        self._pos = save  # restore

        if first[0] in (_TOK_AT, _TOK_PERCENT, _TOK_CARET):
            return {}, self._parse_region()
        if first[0] == _TOK_RBRACE:
            # Empty braces: treat as empty attr dict
            self._advance()  # consume '{'
            self._advance()  # consume '}'
            return {}, None

        return self._parse_attr_dict(), None

    def _parse_attr_dict(self) -> Dict[str, Any]:
        """Parse '{' attr=value, ... '}' roughly; returns dict."""
        self._advance()  # consume '{'
        attrs: Dict[str, Any] = {}
        depth = 1
        while depth > 0 and not self._match(_TOK_EOF):
            tok = self._peek()
            if tok[0] == _TOK_LBRACE:
                depth += 1
                self._advance()
            elif tok[0] == _TOK_RBRACE:
                depth -= 1
                self._advance()
            elif tok[0] == _TOK_AT and depth == 1:
                # @symbol = value (metadata inside region-like attr block)
                at_tok = self._advance()
                symbol = at_tok[1][1:]
                if self._match(_TOK_EQ):
                    self._advance()
                    val = self._parse_literal_value()
                    attrs[symbol] = val
                    self._metadata[symbol] = val
                    # skip optional : type
                    if self._match(_TOK_COLON):
                        self._advance()
                        self._skip_type()
            elif tok[0] == _TOK_IDENT and depth == 1:
                key = self._advance()[1]
                if self._match(_TOK_EQ):
                    self._advance()
                    val = self._parse_literal_value()
                    attrs[key] = val
            else:
                self._advance()
        return attrs

    def _parse_region(self) -> MLIRRegion:
        """Parse a region  '{' block* '}'."""
        self._advance()  # consume '{'
        region = MLIRRegion()
        cur_block = MLIRBlock(label="", args=[])
        region.blocks.append(cur_block)

        while not self._match(_TOK_RBRACE) and not self._match(_TOK_EOF):
            tok = self._peek()

            # Block label: ^bb0:  or  ^bb0(%arg0: type, ...):
            if tok[0] == _TOK_CARET:
                label_tok = self._advance()
                new_block = MLIRBlock(label=label_tok[1], args=[])
                if self._match(_TOK_LPAREN):
                    self._advance()
                    while not self._match(_TOK_RPAREN) and not self._match(_TOK_EOF):
                        if self._match(_TOK_PERCENT):
                            arg_tok = self._advance()
                            new_block.args.append(arg_tok[1][1:])
                            # Register block arg in ssa_graph as a special sentinel
                            self._ssa_graph[arg_tok[1][1:]] = MLIROperation(
                                op_name="block.arg",
                                result_ids=[arg_tok[1][1:]],
                                operand_ids=[],
                                attributes={"block_label": label_tok[1]},
                                regions=[],
                                source_line=tok[2],
                            )
                        else:
                            self._advance()
                    if self._match(_TOK_RPAREN):
                        self._advance()
                if self._match(_TOK_COLON):
                    self._advance()
                cur_block = new_block
                region.blocks.append(cur_block)
                continue

            # Metadata inside region
            if tok[0] == _TOK_AT:
                self._parse_metadata()
                continue

            # Regular operation
            op = self._parse_operation()
            if op is not None:
                cur_block.ops.append(op)

        if self._match(_TOK_RBRACE):
            self._advance()
        return region

    # -- Skip helpers ----------------------------------------------------------

    def _skip_paren_group(self) -> None:
        """Skip balanced '(' ... ')'."""
        self._advance()  # consume '('
        depth = 1
        while depth > 0 and not self._match(_TOK_EOF):
            tok = self._advance()
            if tok[0] == _TOK_LPAREN:
                depth += 1
            elif tok[0] == _TOK_RPAREN:
                depth -= 1

    def _read_balanced(self, open_ch: str, close_ch: str) -> str:
        """Read and return a balanced group as raw string."""
        parts = [open_ch]
        tok = self._advance()  # consume open
        depth = 1
        while depth > 0 and not self._match(_TOK_EOF):
            tok = self._advance()
            parts.append(tok[1])
            if tok[1] == open_ch:
                depth += 1
            elif tok[1] == close_ch:
                depth -= 1
        return "".join(parts)

    def _skip_type(self) -> None:
        """Skip a single type token (possibly nested)."""
        tok = self._peek()
        if tok[0] in (_TOK_BANG, _TOK_IDENT, _TOK_NUMBER):
            self._advance()
            if self._match(_TOK_LPAREN):
                self._skip_paren_group()
        elif tok[0] == _TOK_LPAREN:
            self._skip_paren_group()

    def _skip_type_signature(self) -> None:
        """Skip the rest of a type signature until end-of-op."""
        # A type signature may span multiple tokens but ends at the next newline
        # or the start of the next operation. We conservatively skip until we
        # see a new result (%), a new op-name string, a '{', or EOF.
        stop_kinds = {_TOK_PERCENT, _TOK_STRING, _TOK_EOF, _TOK_CARET, _TOK_AT}
        while True:
            tok = self._peek()
            if tok[0] in stop_kinds:
                break
            if tok[0] == _TOK_LBRACE:
                # Could be an attribute dict or region; leave for caller
                break
            self._advance()

    def _skip_to_next_op(self) -> None:
        """Skip forward until we reach what looks like the next op."""
        stop_kinds = {_TOK_PERCENT, _TOK_STRING, _TOK_CARET, _TOK_AT, _TOK_EOF}
        while True:
            tok = self._peek()
            if tok[0] in stop_kinds:
                break
            self._advance()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_mlir_text(mlir_text: str) -> MLIRModule:
    """
    Parse MLIR text into an MLIRModule operation tree.

    Args:
        mlir_text: Complete MLIR module text (UTF-8 string).

    Returns:
        MLIRModule with top-level ops, metadata dict, and SSA graph.

    Raises:
        SyntaxError: If the text is structurally malformed.

    Performance: < 100 ms for modules up to 1 000 lines.
    """
    tokens = list(_tokenise(mlir_text))
    parser = _Parser(tokens)
    return parser.parse()


def extract_module_metadata(mlir_text: str) -> Dict[str, Any]:
    """
    Convenience: extract only the top-level @symbol metadata from MLIR text.

    Returns a dict with float/int/str values for each @symbol.
    """
    module = parse_mlir_text(mlir_text)
    return module.metadata


def ops_matching(module: MLIRModule, op_name: str) -> List[MLIROperation]:
    """Return all operations with the given name (via full pre-order walk)."""
    return [op for op in module.walk() if op.op_name == op_name]
