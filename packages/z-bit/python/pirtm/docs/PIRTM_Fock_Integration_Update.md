# PIRTM core update for Fock lemma import

## Suggested new import chain

Add to the Layer-II/Layer-III formal path:

```lean
import PhaseMirror.PIRTM.Foundations.Fock
import PhaseMirror.PIRTM.FockContractivity
```

or in the Pro track:

```lean
import Pirtm.Foundations.Fock
import Pirtm.FockContractivity
```

## Suggested theorem dependency order
1. `Foundations/Fock.lean` — vacuum, creation/annihilation operators, sector structure.
2. `FockContractivity.lean` — direct-sum/operator norm lemmas and `pirtmUpdateFock_contractingWith`.
3. `LayerIIStability.lean` — preservation of contractivity through the Fock embedding.
4. `LayerIIIResonance.lean` — admissible resonance perturbations under certified contraction bounds.

## Python alignment
Update `core/fock.py` and `core/certify.py` so that the emitted formal bridge metadata includes:
- `fock_cutoff`
- `fock_op_norm`
- `fock_contraction_const`
- `layer2_formally_compliant`
