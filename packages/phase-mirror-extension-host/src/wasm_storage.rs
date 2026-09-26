use super::*;

/// WASM storage backend for Hologram OS.
///
/// This implementation delegates storage to Hologram OS's content-addressed
/// storage layer via UCAN capability injection, bridging over the MCP protocol.
#[derive(Debug, Clone, Default)]
pub struct WasmStorageBackend;

impl StorageBackend for WasmStorageBackend {
    fn store_receipt(&self, receipt: &ContractivityReceipt) -> Result<(), ExtensionHostError> {
        // In a real WASM build, this would use web-sys to call Hologram OS MCP `verify_object`
        // or a dedicated Host capability to register the receipt.
        
        let receipt_json = serde_json::to_string(receipt)
            .map_err(|e| ExtensionHostError::new(format!("Serialization failed: {}", e)))?;
            
        // Stub: Bridging into Hologram OS MCP (dispatch_extension)
        #[cfg(target_arch = "wasm32")]
        {
            // window.postMessage or similar to bridge into the Hologram OS worker sandbox
            let _ = receipt_json;
        }

        Ok(())
    }

    fn read_receipts(&self, _since_ms: i64) -> Result<Vec<ContractivityReceipt>, ExtensionHostError> {
        // Would resolve from Hologram OS content store
        Ok(Vec::new())
    }

    fn store_sync_queue(&self, _entries: &[SyncQueueEntry]) -> Result<(), ExtensionHostError> {
        Ok(())
    }

    fn read_sync_queue(&self) -> Result<Vec<SyncQueueEntry>, ExtensionHostError> {
        Ok(Vec::new())
    }
}
