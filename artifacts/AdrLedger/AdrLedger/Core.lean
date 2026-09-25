namespace AdrLedger

inductive Wire where
  | adr005
  | unboundDraft
  deriving DecidableEq, Repr

def hideAccepts : Wire → Bool
  | .adr005       => true
  | .unboundDraft => false

inductive Status where
  | proposed
  | accepted
  | deprecated
  | superseded
  deriving DecidableEq, Repr

inductive Event where
  | publish (id : String)
  | accept (id : String)
  | deprecate (id : String)
  | supersede (old_id new_id : String)
  deriving DecidableEq, Repr

abbrev Ledger := List Event

/-- Evaluates the current status of an ADR id by walking the event history. -/
def getStatus (id : String) : Ledger → Option Status
  | [] => none
  | Event.publish i :: tail =>
      if i = id then some Status.proposed else getStatus id tail
  | Event.accept i :: tail =>
      if i = id then some Status.accepted else getStatus id tail
  | Event.deprecate i :: tail =>
      if i = id then some Status.deprecated else getStatus id tail
  | Event.supersede o _ :: tail =>
      if o = id then some Status.superseded else getStatus id tail

def isKnown (id : String) (h : Ledger) : Bool :=
  match getStatus id h with
  | none => false
  | some _ => true

/-- The inductive rules for a valid ledger history. -/
inductive Valid : Ledger → Prop where
  | nil : Valid []
  | publish {id h} :
      Valid h → getStatus id h = none → Valid (Event.publish id :: h)
  | accept {id h} :
      Valid h → getStatus id h = some Status.proposed → Valid (Event.accept id :: h)
  | deprecate {id h} :
      Valid h → (getStatus id h = some Status.proposed ∨ getStatus id h = some Status.accepted) → Valid (Event.deprecate id :: h)
  | supersede {old_id new_id h} :
      Valid h → old_id ≠ new_id → getStatus old_id h = some Status.accepted →
      isKnown new_id h = true → Valid (Event.supersede old_id new_id :: h)

end AdrLedger
