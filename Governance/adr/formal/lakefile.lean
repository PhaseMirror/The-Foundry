import Lake
open Lake DSL

package «adr-formal» {
  buildDir := ".lake/build"
}

@[default_target]
lean_lib ADR {
  roots := #[
    `ADR.Core,
    `ADR.Proofs,
    `ADR.Examples,
    `ADR.Export,
    `Generated.AEGISS_Witness
  ]
}

lean_exe «adr-test» {
  root := `ADR.Test
}
