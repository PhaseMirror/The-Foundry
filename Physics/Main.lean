/-!
# Physics — Main Entry Point

Entry point for the `physicsTest` executable.

Usage:
```bash
lake build Physics
lake run physicsTest
```
-/

import Physics.Test

namespace Physics.Main

/-- Run the Physics test harness. -/
def main : IO Unit := Physics.Test.main

end Physics.Main
