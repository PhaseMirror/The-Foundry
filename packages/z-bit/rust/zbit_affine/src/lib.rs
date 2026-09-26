//! FFI glue for the Lean 4 `AffineCore` shared library.
//! This stub loads `libaffinecore.so` at runtime using `libloading`.
//! Real functions can be added later to call exported symbols.

use anyhow::{anyhow, Result};
use libloading::{Library, Symbol};
use std::path::PathBuf;

/// Represents a loaded AffineCore library.
pub struct AffineCore {
    _lean_runtime: Library,
    lib: Library,
}

impl AffineCore {
    /// Load the shared library from the given path (or the default location).
    pub fn load<P: Into<PathBuf>>(lib_path: P) -> Result<Self> {
        let lib_path = lib_path.into();
        
        // Load the Lean runtime shared library first with RTLD_GLOBAL
        // so that libaffinecore.so can resolve its Lean symbols.
        let lean_runtime_path = PathBuf::from(
            "/home/citizen/.elan/toolchains/leanprover--lean4---v4.34.0-rc2/lib/lean/libleanshared.so"
        );
        
        let lean_runtime = unsafe {
            libloading::os::unix::Library::open(
                Some(&lean_runtime_path),
                libc::RTLD_GLOBAL | libc::RTLD_NOW,
            ).map_err(|e| anyhow!("failed to load Lean runtime {}: {}", lean_runtime_path.display(), e))?
        };
        
        let lib = unsafe { Library::new(&lib_path) }
            .map_err(|e| anyhow!("failed to load AffineCore library {}: {}", lib_path.display(), e))?;
        
        Ok(Self { _lean_runtime: lean_runtime.into(), lib })
    }

    /// Example of retrieving a symbol named `example_function`.
    /// The actual signature should match the exported Lean function.
    pub unsafe fn get_example(&self) -> Result<Symbol<'_, unsafe extern "C" fn()>> {
        let sym = self.lib.get::<unsafe extern "C" fn()>(b"example_function\0")?;
        Ok(sym)
    }
}

/// Convenience helper that loads the library from the standard Lake build output.
pub fn load_default() -> Result<AffineCore> {
    let lib_path = PathBuf::from("/home/citizen/Multiplicity/z-bit/lean4/.lake/build/lib/libaffinecore.so");
    AffineCore::load(lib_path)
}


