import Lake
open Lake DSL

package «phase_mirror_adr» where

@[default_target]
lean_lib «PhaseMirror» where

lean_exe «adr_test» where
  root := `PhaseMirror.ADR.Test
