use super::*;

/// Native storage backend for VS Code extension sidecar.
///
/// This is a stub implementation. Production code should use
/// platform-specific file I/O or IPC to the VS Code extension host.
#[derive(Debug, Clone, Default)]
pub struct NativeStorageBackend;

impl StorageBackend for NativeStorageBackend {
    fn store_receipt(&self, _receipt: &ContractivityReceipt) -> Result<(), ExtensionHostError> {
        Ok(())
    }

    fn read_receipts(&self, _since_ms: i64) -> Result<Vec<ContractivityReceipt>, ExtensionHostError> {
        Ok(Vec::new())
    }

    fn store_sync_queue(&self, _entries: &[SyncQueueEntry]) -> Result<(), ExtensionHostError> {
        Ok(())
    }

    fn read_sync_queue(&self) -> Result<Vec<SyncQueueEntry>, ExtensionHostError> {
        Ok(Vec::new())
    }
}
