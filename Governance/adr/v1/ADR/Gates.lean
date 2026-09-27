import ADR.Core

namespace ADR.Gates

-- Gate predicates for each ADR-PML

def gate_onchain_deployed : Gate := {
  name := "On-chain Contracts Deployed",
  satisfied := false  -- Set to true once deployed
}

def gate_nats_live : Gate := {
  name := "NATS JetStream Live",
  satisfied := false
}

def gate_batch_anchor_built : Gate := {
  name := "batch_anchor Built",
  satisfied := true   -- Verified via offline tests
}

def gate_sidecar_wired : Gate := {
  name := "Sidecar Batch Wiring Complete",
  satisfied := true   -- Verified via TypeScript tests
}

def gate_gas_benchmark : Gate := {
  name := "Gas Cost < 200k",
  satisfied := false  -- Requires live chain measurement
}

def gate_testnet_run : Gate := {
  name := "Testnet Validation Complete",
  satisfied := false  -- Requires Anvil/Forge/Cast availability
}

def grafana_panel : Gate := {
  name := "Grafana Monitoring Panel",
  satisfied := false
}

def cron_job : Gate := {
  name := "Cron/CronJob Active",
  satisfied := false
}

-- Combined gate sets per ADR

def adr055_gates : List Gate := [
  gate_onchain_deployed,
  gate_nats_live,
  gate_testnet_run,
  grafana_panel,
  cron_job
]

def adr050_gates : List Gate := [
  gate_onchain_deployed,
  gate_batch_anchor_built,
  gate_sidecar_wired,
  gate_gas_benchmark,
  gate_testnet_run
]

end ADR.Gates
