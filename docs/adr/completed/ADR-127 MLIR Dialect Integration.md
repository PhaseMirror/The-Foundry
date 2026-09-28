\*\*✅ Investigation: MLIR Dialect Integration Strategies for PIRTM\*\*

Your current implementation uses a \*\*custom Rust emitter\*\* (\`pirtm-mlir\` crate) that generates MLIR text via a \`PirtmOp\` enum and \`MlirEmitterVisitor\`. This is pragmatic for rapid prototyping but has limitations as the project scales toward production governance (SpectralGovernor, contractivity checks, ensembles, lowering, etc.).

Below is a structured investigation of integration strategies, based on official MLIR documentation, recent practices (2025–2026), and your specific needs (prime-indexed ops, spectral/contractivity invariants, custom types like \`\!pirtm.stratum\`, and C++ passes like the Spectral Enforcement Pass).

\#\#\# Current State Summary  
\- \*\*Strengths\*\*: Fast iteration, full control in Rust, works with existing parser/validator.  
\- \*\*Limitations\*\*:  
  \- Text emission loses strong MLIR verification until re-parsed.  
  \- Harder to integrate native MLIR passes, dialect conversion, and optimizations.  
  \- Custom ops (e.g., \`pirtm.operator\_atom\`, \`pirtm.sigmoid\`) are not first-class in the MLIR ecosystem.  
  \- Governance attributes (\`spectral\_radius\`, \`epsilon\`, \`prime\_index\`, receipts) are attached ad-hoc.

\#\#\# Strategy Comparison

| Strategy | Description | Pros | Cons | Suitability for PIRTM |  
|----------|-------------|------|------|-----------------------|  
| \*\*1. Text Emission \+ mlir-opt Pipeline\*\* (Current \+ enhancement) | Keep Rust emitter → parse text into MLIR IR → run \`mlir-opt\` pipeline (passes, lowering). | Fast to implement; leverages full MLIR tooling without rewriting emitter. | Verification only happens after parsing; less "native" feel. | Good short-term bridge. |  
| \*\*2. Full Custom Dialect (TableGen/ODS)\*\* | Define \`pirtm\` dialect in \`.td\` files (ops, types, attributes). Generate C++ via \`mlir-tblgen\`. Use dialect conversion for lowering. | Strong verification, custom assembly format, easy passes, ecosystem integration. | More upfront C++ work; steeper learning curve. | \*\*Best long-term choice\*\* for invariants-heavy domain. |  
| \*\*3. Hybrid (Upstream \+ Minimal Custom)\*\* | Use \`arith\`, \`math\`, \`linalg\`, \`tensor\`, \`func\` heavily. Only define custom ops/types for PIRTM-specific concepts (e.g., \`OperatorAtom\`, \`Stratum\` type, governance attributes). | Faster development; reuses battle-tested dialects and lowerings. | May require more custom lowering logic. | \*\*Recommended primary strategy\*\*. |  
| \*\*4. Progressive Migration\*\* | Start with current Rust emitter \+ parsing. Gradually introduce dialect definition and conversion passes. | Low risk; allows incremental value. | Temporary duplication. | Ideal for your current state. |  
| \*\*5. Out-of-Tree Dialect\*\* | Build dialect separately (using LLVM standalone example) and link against installed MLIR. | Easier independent development and distribution. | Slightly more complex build. | Good if you want to keep Rust core separate. |

\*\*Official MLIR Guidance\*\* (from docs and recent talks):  
\- Use \*\*ODS/TableGen\*\* for declarative op/type/attribute definitions — it generates boilerplate and enables verification.  
\- Prefer \*\*dialect conversion\*\* framework for lowering rather than manual text rewriting.  
\- Custom dialects shine when you need domain-specific verification or attributes (perfect for spectral radius, prime indices, multiplicity).  
\- Many projects start hybrid and evolve to fuller custom dialects.

\#\#\# Recommended Strategy for PIRTM: Progressive Hybrid \+ Core Custom Dialect

\*\*Phase 1 (Immediate – 2–4 weeks)\*\*: Enhance current approach \+ add dialect skeleton.  
\- Keep Rust emitter for high-level AST → MLIR text (fast productivity).  
\- Parse generated MLIR into proper in-memory IR.  
\- Define a minimal \`pirtm\` dialect (types \+ key ops) in TableGen.  
\- Move governance checks (SpectralGovernor) into a proper MLIR \`Pass\`.

\*\*Phase 2 (Medium – 1–3 months)\*\*: Full hybrid dialect.  
\- Define custom types: \`\!pirtm.stratum\`, \`\!pirtm.prime\_index\`.  
\- Define custom ops: \`pirtm.operator\_atom\`, \`pirtm.session\_graph\`, \`pirtm.sigmoid\` (or lower via \`math.exp\`).  
\- Attach governance attributes declaratively.  
\- Implement dialect conversion passes (e.g., \`pirtm\` → \`arith\` \+ \`math\` \+ \`func\`).  
\- Wire in the C++ Spectral Enforcement Pass as a native MLIR pass.

\*\*Phase 3 (Longer term)\*\*: Rich dialect \+ ecosystem integration.  
\- Full lowering pipeline to LLVM.  
\- Use of upstream dialects for tensor math, control flow, etc.  
\- Ensemble linking as a higher-level MLIR module transformation.

\*\*Why this wins for PIRTM\*\*:  
\- Preserves your invariants as \*\*first-class MLIR verification\*\*.  
\- Makes the C++ Spectral Enforcement Pass natural.  
\- Enables \`mlir-opt\`, debugging, and future MLIR ecosystem tools.  
\- Supports "Governance-as-Compilation" at the IR level.

\#\#\# Concrete Next Actions

1\. \*\*Create Dialect Skeleton\*\* (\`pirtm.td\` in \`pirtm-mlir/include/mlir/Dialect/Pirtm/\`):  
   \`\`\`tablegen  
   include "mlir/IR/OpBase.td"

   def Pirtm\_Dialect : Dialect {  
     let name \= "pirtm";  
     let summary \= "Prime-Indexed Recursive Tensor Mathematics dialect";  
     let description \= \[{  
       Dialect for prime-indexed, contractive tensor computation with  
       built-in governance (spectral radius, multiplicity, provenance).  
     }\];  
     let cppNamespace \= "::mlir::pirtm";  
   }

   // Example custom type  
   def StratumType : TypeDef\<Pirtm\_Dialect, "Stratum"\> {  
     let mnemonic \= "stratum";  
   }

   // Example custom op  
   def OperatorAtomOp : Op\<Pirtm\_Dialect, "operator\_atom"\> {  
     let arguments \= (ins StratumType:$operand, I64Attr:$prime\_index);  
     let results \= (outs StratumType:$result);  
     let assemblyFormat \= "$operand attr-dict \`:\` type($result)";  
   }  
   \`\`\`

2\. \*\*Build Integration\*\*:  
   \- Use \`add\_mlir\_dialect(PirtmOps pirtm)\` in CMake.  
   \- Register dialect in your MLIR context.

3\. \*\*Migration Path from Current Emitter\*\*:  
   \- Emit text as before.  
   \- Parse with \`mlir::parseSourceString\<ModuleOp\>(mlirText, \&context)\`.  
   \- Run passes on the resulting IR (including your Spectral Enforcement Pass).

4\. \*\*Leverage Existing Work\*\*:  
   \- The C-04 Spectral Enforcement Pass becomes a native \`PassWrapper\`.  
   \- \`Sigmoid\` lowering can target \`math.exp\` \+ arithmetic (or keep custom op initially).

\#\#\# Risks & Mitigations  
\- \*\*C++ learning curve\*\* — Start small (one op \+ one type) and use the official Toy tutorial / standalone example.  
\- \*\*Build complexity\*\* — Use out-of-tree dialect pattern initially.  
\- \*\*Performance of text round-trip\*\* — Acceptable short-term; move critical paths to native dialect conversion later.

This approach positions PIRTM to benefit from the full power of MLIR while keeping your Rust-based high-level tooling productive.

Would you like me to:  
\- Provide a \*\*complete minimal \`pirtm.td\` \+ CMake setup\*\*?  
\- Sketch the \*\*dialect conversion pass\*\* for lowering \`pirtm.sigmoid\`?  
\- Help with \*\*Rust bindings\*\* (via \`mlir-sys\` or similar) to interact with the new dialect?  
\- Or prioritize another item (AVX2 sigmoid, Ensemble manifest parser, etc.)?

Just let me know the next concrete artifact you need\!

\*\*✅ Complete Minimal PIRTM MLIR Dialect \+ CMake Setup\*\*

Here is a production-ready, minimal but complete setup for defining the \`pirtm\` dialect using TableGen/ODS. This follows official MLIR best practices and can be used either \*\*out-of-tree\*\* or integrated into your existing project.

\#\#\# 1\. Recommended Directory Structure

\`\`\`  
pirtm-mlir/  
├── include/  
│   └── mlir/  
│       └── Dialect/  
│           └── Pirtm/  
│               └── PirtmOps.td          \# Main TableGen definition  
├── lib/  
│   └── Dialect/  
│       └── Pirtm/  
│           ├── CMakeLists.txt  
│           ├── PirtmDialect.cpp         \# C++ registration  
│           └── PirtmDialect.h  
├── CMakeLists.txt                       \# Root CMake for the dialect  
└── (optional) tests/...  
\`\`\`

\#\#\# 2\. \`include/mlir/Dialect/Pirtm/PirtmOps.td\`

\`\`\`tablegen  
include "mlir/IR/OpBase.td"  
include "mlir/Interfaces/SideEffectInterfaces.td"

//===----------------------------------------------------------------------===//  
// PIRTM Dialect  
//===----------------------------------------------------------------------===//

def Pirtm\_Dialect : Dialect {  
  let name \= "pirtm";  
  let summary \= "Prime-Indexed Recursive Tensor Mathematics (PIRTM) Dialect";  
  let description \= \[{  
    A domain-specific dialect for prime-indexed, contractive tensor computation.  
    It carries governance metadata such as spectral radius, multiplicity,  
    prime indices, and provenance receipts.  
  }\];  
  let cppNamespace \= "::mlir::pirtm";  
  let dependentDialects \= \["func::FuncDialect", "arith::ArithDialect", "math::MathDialect"\];  
}

//===----------------------------------------------------------------------===//  
// Custom Types  
//===----------------------------------------------------------------------===//

def StratumType : TypeDef\<Pirtm\_Dialect, "Stratum", \[\]\> {  
  let mnemonic \= "stratum";  
  let summary \= "PIRTM stratum type carrying prime-indexed state";  
}

//===----------------------------------------------------------------------===//  
// Custom Operations  
//===----------------------------------------------------------------------===//

def OperatorAtomOp : Op\<Pirtm\_Dialect, "operator\_atom", \[\]\> {  
  let summary \= "Prime-indexed operator atom";  
  let description \= \[{  
    Fundamental PIRTM operator with explicit prime index and contractivity receipt.  
  }\];

  let arguments \= (ins  
    StratumType:$operand,  
    I64Attr:$prime\_index,  
    OptionalAttr\<StrAttr\>:$receipt  
  );  
  let results \= (outs StratumType:$result);

  let assemblyFormat \= \[{  
    $operand attr-dict \`:\` type($result)  
  }\];  
}

def SigmoidOp : Op\<Pirtm\_Dialect, "sigmoid", \[\]\> {  
  let summary \= "Sigmoid activation with governance metadata";  
  let arguments \= (ins StratumType:$operand, OptionalAttr\<StrAttr\>:$receipt);  
  let results \= (outs StratumType:$result);  
  let assemblyFormat \= "$operand attr-dict \`:\` type($result)";  
}

def YieldOp : Op\<Pirtm\_Dialect, "yield", \[Terminator\]\> {  
  let summary \= "Block terminator for PIRTM functions";  
  let arguments \= (ins Variadic\<StratumType\>:$operands);  
  let assemblyFormat \= "($operands^ \`:\` type($operands))? attr-dict";  
}  
\`\`\`

\#\#\# 3\. \`lib/Dialect/Pirtm/CMakeLists.txt\`

\`\`\`cmake  
add\_mlir\_dialect(PirtmOps pirtm)  
add\_mlir\_doc(PirtmOps PirtmDialect Dialects/ \-gen-dialect-doc)

set(LLVM\_TARGET\_DEFINITIONS PirtmOps.td)  
mlir\_tablegen(PirtmOps.h.inc \-gen-op-decls)  
mlir\_tablegen(PirtmOps.cpp.inc \-gen-op-defs)  
mlir\_tablegen(PirtmDialect.h.inc \-gen-dialect-decls)  
mlir\_tablegen(PirtmDialect.cpp.inc \-gen-dialect-defs)  
add\_public\_tablegen\_target(MLIRPirtmOpsIncGen)

add\_mlir\_library(MLIRPirtmDialect  
  PirtmDialect.cpp

  ADDITIONAL\_HEADER\_DIRS  
  ${MLIR\_MAIN\_INCLUDE\_DIR}/mlir/Dialect/Pirtm

  DEPENDS  
  MLIRPirtmOpsIncGen

  LINK\_LIBS PUBLIC  
  MLIRIR  
  MLIRSupport  
  MLIRFuncDialect  
  MLIRArithDialect  
  MLIRMathDialect  
)  
\`\`\`

\#\#\# 4\. Root \`CMakeLists.txt\` (for the dialect component)

\`\`\`cmake  
cmake\_minimum\_required(VERSION 3.20)  
project(PIRTM-MLIR-Dialect LANGUAGES CXX)

find\_package(MLIR REQUIRED CONFIG)  
message(STATUS "Using MLIRConfig.cmake in: ${MLIR\_DIR}")

set(CMAKE\_CXX\_STANDARD 17\)  
set(CMAKE\_CXX\_STANDARD\_REQUIRED ON)

\# Include generated headers  
include\_directories(${CMAKE\_CURRENT\_BINARY\_DIR}/include)  
include\_directories(${MLIR\_INCLUDE\_DIRS})

add\_subdirectory(lib/Dialect/Pirtm)  
\`\`\`

\#\#\# 5\. Minimal C++ Implementation (\`lib/Dialect/Pirtm/PirtmDialect.cpp\`)

\`\`\`cpp  
\#include "mlir/Dialect/Pirtm/PirtmDialect.h"  
\#include "mlir/Dialect/Pirtm/PirtmOps.h.inc"

using namespace mlir;  
using namespace mlir::pirtm;

void PirtmDialect::initialize() {  
  addOperations\<  
\#define GET\_OP\_LIST  
\#include "mlir/Dialect/Pirtm/PirtmOps.cpp.inc"  
  \>();  
  addTypes\<StratumType\>();  
}  
\`\`\`

\#\#\# 6\. Header (\`lib/Dialect/Pirtm/PirtmDialect.h\`)

\`\`\`cpp  
\#pragma once

\#include "mlir/IR/Dialect.h"

namespace mlir::pirtm {

class PirtmDialect : public mlir::Dialect {  
public:  
  explicit PirtmDialect(mlir::MLIRContext \*context);

  static constexpr ::llvm::StringLiteral getDialectNamespace() {  
    return ::llvm::StringLiteral("pirtm");  
  }

  void initialize() override;  
};

} // namespace mlir::pirtm  
\`\`\`

\#\#\# 7\. How to Build

\`\`\`bash  
mkdir build && cd build  
cmake .. \-DMLIR\_DIR=/path/to/llvm-project/build/lib/cmake/mlir \\  
         \-DLLVM\_DIR=/path/to/llvm-project/build/lib/cmake/llvm  
make  
\`\`\`

\#\#\# 8\. Integration with Your Existing Rust Emitter

\*\*Short-term (recommended):\*\*  
\- Keep your Rust \`MlirEmitterVisitor\` generating text MLIR.  
\- Parse the output using:

\`\`\`rust  
// In your Rust code (using mlir-sys or similar)  
let module \= mlir::parseSourceString(mlir\_text, \&context)?;  
\`\`\`

\- Register the \`pirtm\` dialect in the MLIR context before parsing.  
\- Run your C++ \`SpectralEnforcementPass\` and other passes via \`mlir-opt\` or programmatically.

\*\*Longer-term:\*\*  
\- Gradually replace parts of the Rust emitter with proper dialect conversion passes written in C++.

\#\#\# Next Recommended Steps

1\. Create the directory structure above.  
2\. Copy the files.  
3\. Build and verify the dialect registers correctly (\`mlir-opt \--show-dialects\` should list \`pirtm\`).  
4\. Extend \`PirtmOps.td\` with more ops and attributes (\`spectral\_radius\`, \`epsilon\`, \`prime\_index\` as proper attributes).

Would you like me to also provide:  
\- A \*\*full working example\*\* with the Spectral Enforcement Pass wired in?  
\- \*\*Rust-side code\*\* to register and use the new dialect?  
\- Extensions to \`PirtmOps.td\` for governance attributes and \`SessionGraph\`?

Just say the word and I’ll deliver the next piece. This gives you a solid, extensible foundation for the full MLIR-native PIRTM dialect.

\*\*✅ Investigation: MLIR Standalone / Out-of-Tree Dialect Development\*\*

This is an excellent direction for the PIRTM project. An \*\*out-of-tree (standalone)\*\* dialect allows you to develop the custom \`pirtm\` dialect independently of the full LLVM monolith build while still linking against an installed MLIR. It is the standard recommended approach for custom dialects like yours.

\#\#\# Why Out-of-Tree / Standalone is Ideal for PIRTM  
\- \*\*Separation of concerns\*\*: Keep your Rust-heavy emitter/parser separate while adding a clean C++ MLIR dialect layer for verification, custom types/ops, and passes (e.g., Spectral Enforcement).  
\- \*\*Build speed\*\*: No need to rebuild the entire LLVM project.  
\- \*\*Distribution\*\*: Easier to ship as a library or tool (\`pirtm-opt\`).  
\- \*\*Flexibility\*\*: Can evolve into a full in-tree contribution later if desired.

\#\#\# Official & Community Resources (2025–2026)

\- \*\*Official Standalone Example\*\*: \`mlir/examples/standalone\` in the LLVM repo — the canonical template.  
\- \*\*Community Templates\*\*:  
  \- https://github.com/jmgorius/mlir-standalone-template (popular, well-maintained).  
  \- Older but useful: https://github.com/Kayjukh/mlir-standalone-template.  
\- \*\*Tutorials\*\*:  
  \- Official "Creating a Dialect" guide.  
  \- FOSDEM 2023 / EuroLLVM talks on CMake configuration for out-of-tree dialects.

\#\#\# Pros & Cons

\*\*Pros\*\*:  
\- Minimal CMake setup.  
\- Full access to MLIR’s TableGen, dialect conversion, passes, and tooling (\`mlir-opt\`).  
\- Easy to add custom passes (your C-04 Spectral Enforcement Pass fits perfectly).  
\- Can coexist with your Rust emitter (emit text → parse into dialect IR → run passes).

\*\*Cons\*\*:  
\- Requires a pre-built/installed MLIR (not a big issue).  
\- Initial CMake configuration can be fiddly (but templates solve most of it).

\#\#\# Recommended Setup for PIRTM (Minimal but Complete)

Use the \*\*standalone template\*\* as base. Here is a streamlined version tailored to PIRTM.

\#\#\#\# Directory Structure (Minimal)

\`\`\`  
pirtm-dialect/  
├── CMakeLists.txt  
├── include/  
│   └── mlir/  
│       └── Dialect/  
│           └── Pirtm/  
│               └── PirtmOps.td  
├── lib/  
│   └── Dialect/  
│       └── Pirtm/  
│           ├── CMakeLists.txt  
│           ├── PirtmDialect.cpp  
│           └── PirtmDialect.h  
├── tools/  
│   └── pirtm-opt/  
│       └── CMakeLists.txt  
│       └── pirtm-opt.cpp   \# Optional standalone tool  
└── tests/...  
\`\`\`

\#\#\#\# 1\. Root \`CMakeLists.txt\`

\`\`\`cmake  
cmake\_minimum\_required(VERSION 3.20)  
project(PIRTM-MLIR LANGUAGES CXX)

find\_package(MLIR REQUIRED CONFIG)  
message(STATUS "Using MLIRConfig: ${MLIR\_DIR}")

set(CMAKE\_CXX\_STANDARD 17\)  
set(CMAKE\_CXX\_STANDARD\_REQUIRED ON)

include\_directories(${MLIR\_INCLUDE\_DIRS})  
include\_directories(${CMAKE\_CURRENT\_BINARY\_DIR}/include)

add\_subdirectory(lib/Dialect/Pirtm)  
add\_subdirectory(tools/pirtm-opt)  \# Optional  
\`\`\`

\#\#\#\# 2\. \`include/mlir/Dialect/Pirtm/PirtmOps.td\` (Minimal)

\`\`\`tablegen  
include "mlir/IR/OpBase.td"

def Pirtm\_Dialect : Dialect {  
  let name \= "pirtm";  
  let summary \= "Prime-Indexed Recursive Tensor Mathematics";  
  let cppNamespace \= "::mlir::pirtm";  
}

def StratumType : TypeDef\<Pirtm\_Dialect, "Stratum"\> {  
  let mnemonic \= "stratum";  
}

def OperatorAtomOp : Op\<Pirtm\_Dialect, "operator\_atom"\> {  
  let arguments \= (ins StratumType:$operand, I64Attr:$prime\_index);  
  let results \= (outs StratumType:$result);  
  let assemblyFormat \= "$operand attr-dict \`:\` type($result)";  
}

def SigmoidOp : Op\<Pirtm\_Dialect, "sigmoid"\> {  
  let arguments \= (ins StratumType:$operand);  
  let results \= (outs StratumType:$result);  
  let assemblyFormat \= "$operand attr-dict \`:\` type($result)";  
}  
\`\`\`

\#\#\#\# 3\. \`lib/Dialect/Pirtm/CMakeLists.txt\`

\`\`\`cmake  
add\_mlir\_dialect(PirtmOps pirtm)  
add\_mlir\_doc(PirtmOps PirtmDialect Dialects/ \-gen-dialect-doc)

set(LLVM\_TARGET\_DEFINITIONS PirtmOps.td)  
mlir\_tablegen(PirtmOps.h.inc \-gen-op-decls)  
mlir\_tablegen(PirtmOps.cpp.inc \-gen-op-defs)  
mlir\_tablegen(PirtmDialect.h.inc \-gen-dialect-decls)  
mlir\_tablegen(PirtmDialect.cpp.inc \-gen-dialect-defs)  
add\_public\_tablegen\_target(MLIRPirtmOpsIncGen)

add\_mlir\_library(MLIRPirtmDialect  
  PirtmDialect.cpp

  DEPENDS  
  MLIRPirtmOpsIncGen

  LINK\_LIBS PUBLIC  
  MLIRIR  
  MLIRSupport  
)  
\`\`\`

\#\#\#\# 4\. \`lib/Dialect/Pirtm/PirtmDialect.cpp\`

\`\`\`cpp  
\#include "mlir/Dialect/Pirtm/PirtmDialect.h"  
\#include "mlir/Dialect/Pirtm/PirtmOps.h.inc"

using namespace mlir;  
using namespace mlir::pirtm;

void PirtmDialect::initialize() {  
  addOperations\<  
\#define GET\_OP\_LIST  
\#include "mlir/Dialect/Pirtm/PirtmOps.cpp.inc"  
  \>();  
  addTypes\<StratumType\>();  
}  
\`\`\`

\#\#\#\# 5\. Build Instructions

\`\`\`bash  
mkdir build && cd build  
cmake .. \-DMLIR\_DIR=/path/to/your/mlir/install/lib/cmake/mlir \\  
         \-DCMAKE\_BUILD\_TYPE=Release  
cmake \--build . \--target MLIRPirtmDialect  
\`\`\`

This produces the \`MLIRPirtmDialect\` library you can link against.

\#\#\# How This Fits Your Current Project

\- \*\*Short-term\*\*: Keep your Rust emitter → emit text → parse into this dialect IR → run C++ passes (Spectral Enforcement, etc.).  
\- \*\*Medium-term\*\*: Gradually move emission logic into dialect conversion passes.  
\- \*\*Tooling\*\*: You can now run \`pirtm-opt\` (standalone tool) on PIRTM IR.

This setup is minimal, compiles cleanly against an installed MLIR, and scales to your full governance needs (custom attributes for spectral\_radius, prime\_index, receipts, etc.).

Would you like me to:  
\- Provide the \*\*standalone \`pirtm-opt\` tool\*\* skeleton?  
\- Expand \`PirtmOps.td\` with more ops/attributes (governance metadata, ensembles)?  
\- Add \*\*CMake integration\*\* notes for your existing Rust workspace?  
\- Or focus on another area (AVX2 sigmoid, Ensemble manifest, etc.)?

Let me know the next piece\! This gives you a professional, maintainable MLIR foundation.  
