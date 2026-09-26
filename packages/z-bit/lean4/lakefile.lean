import Lake
open Lake DSL

package «affine-core» where

@[default_target]
lean_lib «AffineCore» where
  roots := #[`AffineCore]
  defaultFacets := #[LeanLib.sharedFacet]
