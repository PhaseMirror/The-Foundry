namespace UCC.Logic

inductive Expr where
  | var (name : String)
  | and (e1 e2 : Expr)
  | implies (e1 e2 : Expr)

/-- A simple proof object showing that Context + Decision entails Consequence -/
inductive Entails : Expr → Expr → Expr → Prop where
  | direct (ctx dec cons : Expr) : Entails ctx dec (Expr.implies (Expr.and ctx dec) cons)

structure ProvedADR (CoreADR : Type) where
  adr : CoreADR
  ctx_expr : Expr
  dec_expr : Expr
  cons_expr : Expr
  proof_of_entailment : Entails ctx_expr dec_expr cons_expr

end UCC.Logic
