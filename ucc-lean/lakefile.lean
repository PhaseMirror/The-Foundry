import Lake
open Lake DSL

package «ucc» where
  leanOptions := #[
    ⟨`pp.unicode.fun, true⟩,
    ⟨`autoImplicit, false⟩
  ]

@[default_target]
lean_lib UCC where
  roots := #[`UCC]

lean_exe ucc where
  root := `Main
