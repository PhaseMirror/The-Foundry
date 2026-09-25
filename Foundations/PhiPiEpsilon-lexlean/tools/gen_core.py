#!/usr/bin/env python3
"""Generate src/PhiPiEpsilon.lex.tex (a LexLean semantic module).

The .lex.tex file is the authoritative source for LexLean/PrismPM. This script
only exists so the JSON inside it stays readable and reviewable; run it, then
`lexlean lock && lexlean verify`.
"""
import json
import pathlib

# ---------- term / type helpers ----------
def named(m): return {"arguments": [], "kind": "named", "member": {"name": m}}
NAT = {"kind": "nat"}
BOOL = {"kind": "bool"}
def opt(t): return {"kind": "option", "value": t}

def var(x): return {"kind": "var", "name": x}
def nat(v): return {"kind": "nat", "value": str(v)}
def boolean(v): return {"kind": "bool", "value": v}
def ctor(c, args=None, targs=None):
    return {"arguments": args or [], "constructor": {"name": c},
            "kind": "constructor", "type_arguments": targs or []}
def call(f, *args): return {"kind": "call", "function": {"name": f}, "arguments": list(args)}
def proj(v, f): return {"kind": "project", "field": f, "value": v}
def record(t, **fields):
    return {"kind": "record", "type": {"name": t}, "type_arguments": [],
            "fields": [{"field": k, "value": v} for k, v in fields.items()]}
def match(scrut, *branches):
    return {"kind": "match", "scrutinee": scrut,
            "branches": [{"binders": b, "constructor": {"name": c}, "body": body}
                         for c, b, body in branches]}
def eq(l, r): return {"kind": "eq", "left": l, "right": r}
def band(l, r): return {"kind": "and", "left": l, "right": r}
def bnot(v): return {"kind": "not", "value": v}
def add(l, r): return {"kind": "add", "left": l, "right": r}
def beq(l, r): return {"kind": "beq", "left": l, "right": r}
def blt(l, r): return {"kind": "blt", "left": l, "right": r}
def pand(l, r): return {"kind": "prop_and", "left": l, "right": r}

# ---------- proof helpers ----------
RFL = {"kind": "reflexivity"}
def cases(x, *branches):
    return {"kind": "cases", "scrutinee": x,
            "branches": [{"binders": b, "constructor": c, "proof": p} for c, b, p in branches]}
def both(*ps): return {"kind": "constructor", "branches": list(ps)}
def apply(thm, *args): return {"kind": "apply", "theorem": {"name": thm}, "arguments": list(args)}

def p(name, t): return {"name": name, "type": t}

INTENTS = ["exploratory", "declarative", "reflective", "ambiguous",
           "coercive", "forcedResolution", "paradoxSpiral"]

def inductive(name, ctors):
    return {"kind": "inductive", "name": name, "parameters": [], "type_parameters": [],
            "constructors": [{"name": c, "fields": f} for c, f in ctors]}
def structure(name, fields):
    return {"kind": "structure", "name": name, "parameters": [], "type_parameters": [],
            "fields": [{"name": n, "type": t} for n, t in fields]}
def definition(name, params, result, body):
    return {"kind": "definition", "name": name, "axioms": [],
            "parameters": params, "result": result, "body": body}
def theorem(name, params, statement, proof):
    return {"kind": "theorem", "name": name, "axioms": [],
            "parameters": params, "statement": statement, "proof": proof}

D = []

# ================= Types =================
D.append(inductive("Intent", [(i, []) for i in INTENTS]))
D.append(inductive("PauseReason", [("forcedResolution", []), ("paradoxSpiral", [])]))
D.append(inductive("RefusalReason", [("safeBoundary", []), ("riskAtOrAboveThreshold", [])]))
D.append(inductive("Decision", [
    ("reflect", []),
    ("pause", [named("PauseReason")]),
    ("refuse", [named("RefusalReason")]),
]))
D.append(inductive("Threshold", [("below", []), ("atOrAbove", [])]))
D.append(inductive("DecisionKind", [("normal", []), ("pause", []), ("refusal", [])]))
D.append(structure("ExternalAction", [("id", NAT)]))
D.append(structure("Authorization", [("actionId", NAT), ("expiresAt", NAT), ("revoked", BOOL)]))
D.append(structure("Context", [("intent", named("Intent")), ("pressure", NAT), ("recursionDepth", NAT)]))
D.append(structure("Assessment", [("intent", named("Intent")), ("riskScore", NAT)]))
D.append(structure("SystemState", [("riskThreshold", NAT),
                                   ("authorization", opt(named("Authorization"))),
                                   ("now", NAT)]))

I, DEC, CTX, ASM, ST, ACT, AUTH = (named(x) for x in
    ["Intent", "Decision", "Context", "Assessment", "SystemState", "ExternalAction", "Authorization"])

def intent_match(scrut, values):
    return match(scrut, *[(f"Intent.{i}", [], values[i]) for i in INTENTS])

def decision_match(scrut, reflect, pause, refuse):
    return match(scrut, ("Decision.reflect", [], reflect),
                 ("Decision.pause", ["reason"], pause),
                 ("Decision.refuse", ["reason"], refuse))

# ================= Classifiers on decisions =================
D.append(definition("Decision.kind", [p("d", DEC)], named("DecisionKind"),
    decision_match(var("d"), ctor("DecisionKind.normal"), ctor("DecisionKind.pause"),
                   ctor("DecisionKind.refusal"))))
D.append(definition("isReflect", [p("d", DEC)], BOOL,
    decision_match(var("d"), boolean(True), boolean(False), boolean(False))))
D.append(definition("isPause", [p("d", DEC)], BOOL,
    decision_match(var("d"), boolean(False), boolean(True), boolean(False))))
D.append(definition("isRefusal", [p("d", DEC)], BOOL,
    decision_match(var("d"), boolean(False), boolean(False), boolean(True))))

# ================= Intent classes =================
D.append(definition("isOrdinary", [p("i", I)], BOOL, intent_match(var("i"), {
    "exploratory": boolean(True), "declarative": boolean(True), "reflective": boolean(True),
    "ambiguous": boolean(True), "coercive": boolean(False),
    "forcedResolution": boolean(False), "paradoxSpiral": boolean(False)})))
D.append(definition("isPauseIntent", [p("i", I)], BOOL, intent_match(var("i"), {
    **{i: boolean(False) for i in INTENTS},
    "forcedResolution": boolean(True), "paradoxSpiral": boolean(True)})))

# ================= assess =================
D.append(definition("baseRisk", [p("i", I)], NAT, intent_match(var("i"), {
    "exploratory": nat(0), "declarative": nat(0), "reflective": nat(1), "ambiguous": nat(3),
    "coercive": nat(10), "forcedResolution": nat(10), "paradoxSpiral": nat(10)})))
D.append(definition("assess", [p("ctx", CTX)], ASM, record("Assessment",
    intent=proj(var("ctx"), "intent"),
    riskScore=add(add(call("baseRisk", proj(var("ctx"), "intent")), proj(var("ctx"), "pressure")),
                  proj(var("ctx"), "recursionDepth")))))

# ================= route =================
REFLECT = ctor("Decision.reflect")
def PAUSE(r): return ctor("Decision.pause", [ctor(f"PauseReason.{r}")])
def REFUSE(r): return ctor("Decision.refuse", [ctor(f"RefusalReason.{r}")])
TH = named("Threshold")
D.append(definition("thresholdOf", [p("risk", NAT), p("threshold", NAT)], TH,
    match(blt(var("risk"), var("threshold")),
          ("Bool.true", [], ctor("Threshold.below")),
          ("Bool.false", [], ctor("Threshold.atOrAbove")))))
D.append(definition("isBelow", [p("t", TH)], BOOL,
    match(var("t"), ("Threshold.below", [], boolean(True)), ("Threshold.atOrAbove", [], boolean(False)))))
ordinary_branch = match(var("t"),
                        ("Threshold.below", [], REFLECT),
                        ("Threshold.atOrAbove", [], REFUSE("riskAtOrAboveThreshold")))
D.append(definition("routeWith", [p("i", I), p("t", TH)], DEC, intent_match(var("i"), {
    "exploratory": ordinary_branch, "declarative": ordinary_branch,
    "reflective": ordinary_branch, "ambiguous": ordinary_branch,
    "coercive": REFUSE("safeBoundary"),
    "forcedResolution": PAUSE("forcedResolution"),
    "paradoxSpiral": PAUSE("paradoxSpiral")})))
RISK_T = call("thresholdOf", proj(var("a"), "riskScore"), proj(var("st"), "riskThreshold"))
D.append(definition("route", [p("st", ST), p("a", ASM)], DEC,
    call("routeWith", proj(var("a"), "intent"), RISK_T)))
D.append(definition("decideFor", [p("st", ST), p("ctx", CTX)], DEC,
    call("route", var("st"), call("assess", var("ctx")))))

# ================= authorization =================
D.append(definition("Authorization.isValidFor",
    [p("auth", AUTH), p("action", ACT), p("now", NAT)], BOOL,
    band(band(bnot(proj(var("auth"), "revoked")),
              beq(proj(var("auth"), "actionId"), proj(var("action"), "id"))),
         blt(var("now"), proj(var("auth"), "expiresAt")))))
D.append(definition("authorizedFor",
    [p("authorization", opt(AUTH)), p("action", ACT), p("now", NAT)], BOOL,
    match(var("authorization"),
          ("Option.none", [], boolean(False)),
          ("Option.some", ["auth"], call("Authorization.isValidFor", var("auth"), var("action"), var("now"))))))
D.append(definition("mayPerformExternalAction", [p("st", ST), p("d", DEC), p("action", ACT)], BOOL,
    decision_match(var("d"),
        call("authorizedFor", proj(var("st"), "authorization"), var("action"), proj(var("st"), "now")),
        boolean(False), boolean(False))))

# ================= Theorems =================
def ctx_lit(i): return record("Context", intent=ctor(f"Intent.{i}"),
                              pressure=var("pressure"), recursionDepth=var("recursionDepth"))
CTX_PARAMS = [p("st", ST), p("pressure", NAT), p("recursionDepth", NAT)]

# T1 coercive -> neutral safe boundary
D.append(theorem("coercive_gives_safe_boundary", CTX_PARAMS,
    eq(call("decideFor", var("st"), ctx_lit("coercive")), REFUSE("safeBoundary")), RFL))
# T2 / T3 pause intents -> pause, and kind is pause
for i in ["forcedResolution", "paradoxSpiral"]:
    dec = call("decideFor", var("st"), ctx_lit(i))
    D.append(theorem(f"{i}_gives_pause", CTX_PARAMS,
        pand(eq(dec, PAUSE(i)), eq(call("Decision.kind", dec), ctor("DecisionKind.pause"))),
        both(RFL, RFL)))

def per_intent_bool_cases(): # cases i, then cases belowThreshold, rfl
    inner = cases("t", ("below", [], RFL), ("atOrAbove", [], RFL))
    return cases("i", *[(i, [], inner) for i in INTENTS])

# T4 exact characterization of the reflection branch
D.append(theorem("routeWith_reflect_exact", [p("i", I), p("t", TH)],
    eq(call("isReflect", call("routeWith", var("i"), var("t"))),
       band(call("isOrdinary", var("i")), call("isBelow", var("t")))),
    per_intent_bool_cases()))
D.append(theorem("route_reflects_iff_ordinary_and_below_threshold", [p("st", ST), p("a", ASM)],
    eq(call("isReflect", call("route", var("st"), var("a"))),
       band(call("isOrdinary", proj(var("a"), "intent")), call("isBelow", RISK_T))),
    apply("routeWith_reflect_exact", proj(var("a"), "intent"), RISK_T)))
# T5 at or above threshold -> never reflect (any intent)
D.append(theorem("routeWith_at_or_above_threshold_never_reflects", [p("i", I)],
    eq(call("isReflect", call("routeWith", var("i"), ctor("Threshold.atOrAbove"))), boolean(False)),
    cases("i", *[(i, [], RFL) for i in INTENTS])))
# T6 ordinary intent at or above threshold -> refuse (riskAtOrAboveThreshold)
for i in ["exploratory", "declarative", "reflective", "ambiguous"]:
    D.append(theorem(f"{i}_at_or_above_threshold_refused", [],
        eq(call("routeWith", ctor(f"Intent.{i}"), ctor("Threshold.atOrAbove")), REFUSE("riskAtOrAboveThreshold")), RFL))
# T12 pause happens exactly on the two pause intents
D.append(theorem("routeWith_pause_exact", [p("i", I), p("t", TH)],
    eq(call("isPause", call("routeWith", var("i"), var("t"))),
       call("isPauseIntent", var("i"))),
    per_intent_bool_cases()))
D.append(theorem("route_pauses_iff_pause_intent", [p("st", ST), p("a", ASM)],
    eq(call("isPause", call("route", var("st"), var("a"))),
       call("isPauseIntent", proj(var("a"), "intent"))),
    apply("routeWith_pause_exact", proj(var("a"), "intent"), RISK_T)))

# T7 external action exactly = normal decision AND valid stored authorization
D.append(theorem("mayPerform_exact", [p("st", ST), p("d", DEC), p("action", ACT)],
    eq(call("mayPerformExternalAction", var("st"), var("d"), var("action")),
       band(call("isReflect", var("d")),
            call("authorizedFor", proj(var("st"), "authorization"), var("action"), proj(var("st"), "now")))),
    cases("d", ("reflect", [], RFL), ("pause", ["reason"], RFL), ("refuse", ["reason"], RFL))))
# T8 no authorization -> no action
D.append(theorem("no_authorization_no_action",
    [p("riskThreshold", NAT), p("now", NAT), p("d", DEC), p("action", ACT)],
    eq(call("mayPerformExternalAction",
            record("SystemState", riskThreshold=var("riskThreshold"),
                   authorization=ctor("Option.none", [], [AUTH]), now=var("now")),
            var("d"), var("action")), boolean(False)),
    cases("d", ("reflect", [], RFL), ("pause", ["reason"], RFL), ("refuse", ["reason"], RFL))))
# T9 pauses and refusals never act
D.append(theorem("pause_never_acts", [p("st", ST), p("reason", named("PauseReason")), p("action", ACT)],
    eq(call("mayPerformExternalAction", var("st"), ctor("Decision.pause", [var("reason")]), var("action")),
       boolean(False)), RFL))
D.append(theorem("refusal_never_acts", [p("st", ST), p("reason", named("RefusalReason")), p("action", ACT)],
    eq(call("mayPerformExternalAction", var("st"), ctor("Decision.refuse", [var("reason")]), var("action")),
       boolean(False)), RFL))
# T10 revoked authorization is never valid
D.append(theorem("revoked_authorization_invalid",
    [p("actionId", NAT), p("expiresAt", NAT), p("action", ACT), p("now", NAT)],
    eq(call("Authorization.isValidFor",
            record("Authorization", actionId=var("actionId"), expiresAt=var("expiresAt"),
                   revoked=boolean(True)),
            var("action"), var("now")), boolean(False)), RFL))
# T11 pause / refusal / normal are pairwise distinct
D.append(theorem("pause_is_not_refusal_or_normal", [p("reason", named("PauseReason"))],
    pand(eq(call("isRefusal", ctor("Decision.pause", [var("reason")])), boolean(False)),
         eq(call("isReflect", ctor("Decision.pause", [var("reason")])), boolean(False))),
    both(RFL, RFL)))
D.append(theorem("refusal_is_not_pause_or_normal", [p("reason", named("RefusalReason"))],
    pand(eq(call("isPause", ctor("Decision.refuse", [var("reason")])), boolean(False)),
         eq(call("isReflect", ctor("Decision.refuse", [var("reason")])), boolean(False))),
    both(RFL, RFL)))
D.append(theorem("normal_is_not_pause_or_refusal", [],
    pand(eq(call("isPause", REFLECT), boolean(False)),
         eq(call("isRefusal", REFLECT), boolean(False))),
    both(RFL, RFL)))
# helper: assess keeps the classifier label
D.append(theorem("assess_intent", [p("ctx", CTX)],
    eq(proj(call("assess", var("ctx")), "intent"), proj(var("ctx"), "intent")), RFL))

# Concrete sanity checks (closed terms)
DEMO = record("SystemState", riskThreshold=nat(5),
              authorization=ctor("Option.some", [record("Authorization", actionId=nat(7),
                                 expiresAt=nat(100), revoked=boolean(False))], [AUTH]),
              now=nat(10))
def demo_ctx(i, pr, dp): return record("Context", intent=ctor(f"Intent.{i}"), pressure=nat(pr), recursionDepth=nat(dp))
def act(n): return record("ExternalAction", id=nat(n))
for name, stmt in [
    ("demo_low_risk_reflects", eq(call("decideFor", DEMO, demo_ctx("exploratory", 1, 1)), REFLECT)),
    ("demo_ambiguous_over_threshold_refused",
        eq(call("decideFor", DEMO, demo_ctx("ambiguous", 1, 1)), REFUSE("riskAtOrAboveThreshold"))),
    ("demo_threshold_boundary_below", eq(call("thresholdOf", nat(4), nat(5)), ctor("Threshold.below"))),
    ("demo_threshold_boundary_equal", eq(call("thresholdOf", nat(5), nat(5)), ctor("Threshold.atOrAbove"))),
    ("demo_threshold_boundary_above", eq(call("thresholdOf", nat(6), nat(5)), ctor("Threshold.atOrAbove"))),
    ("demo_authorized_action_allowed",
        eq(call("mayPerformExternalAction", DEMO, REFLECT, act(7)), boolean(True))),
    ("demo_wrong_action_denied",
        eq(call("mayPerformExternalAction", DEMO, REFLECT, act(8)), boolean(False))),
]:
    D.append(theorem(name, [], stmt, RFL))

module = {"declarations": D, "spec": "lexlean/semantic-module/1"}
body = json.dumps(module, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
src = ("\\begin{lexlean}{PhiPiEpsilon}\n"
       "\\useglossary{lexlean.std.bool@1.1.0}\n"
       "\\useglossary{lexlean.std.nat@1.1.0}\n"
       "\\title{Boolean}\n"
       "\\begin{semanticmodule}\n"
       "\\semanticdata{" + body + "}\n"
       "\\end{semanticmodule}\n"
       "\\end{lexlean}\n")
out = pathlib.Path(__file__).resolve().parent.parent / "src" / "PhiPiEpsilon.lex.tex"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(src)
print(f"wrote {out} ({len(D)} declarations)")
