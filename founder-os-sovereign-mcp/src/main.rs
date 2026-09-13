use axum::extract::State;
use axum::routing::{get, post};
use axum::{Json, Router};
use founder_os_sovereign_mcp::eventlog::EventLog;
use founder_os_sovereign_mcp::protocol::{serve_stdio, McpServer};
use founder_os_sovereign_mcp::registry::builtin_registry;
use founder_os_sovereign_mcp::tools::{
    self, ContentRequest, CrmfResponse, WorkflowRequest,
};
use std::io;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

const DEFAULT_STATE_DIR: &str = ".state";
const DEFAULT_ADDR: &str = "127.0.0.1:8090";
const LOG_FILE: &str = "eventlog.jsonl";

/// Entrypoint — production default is the MCP stdio transport, which is what
/// MCP clients (Claude Desktop, etc.) use when spawning via `command`.
#[tokio::main]
async fn main() {
    let opts = parse_args();

    match opts.transport.as_str() {
        "stdio" => run_stdio(&opts),
        "http" => run_http(Arc::new(Mutex::new(build_server(&opts))), &opts.addr).await,
        other => {
            eprintln!(
                "founder-os-sovereign-mcp: unknown transport '{other}' (expected stdio|http)"
            );
            std::process::exit(2);
        }
    }
}

fn build_server(opts: &Options) -> McpServer {
    let ledger = EventLog::open(opts.state_dir.join(LOG_FILE))
        .unwrap_or_else(|e| {
            eprintln!("founder-os-sovereign-mcp: cannot open event log: {e}");
            std::process::exit(1);
        });
    let server = McpServer::new(builtin_registry(), ledger);
    eprintln!(
        "founder-os-sovereign-mcp v{} ({})",
        env!("CARGO_PKG_VERSION"),
        server.startup_chain_check()
    );
    server
}

fn run_stdio(opts: &Options) {
    let mut server = build_server(opts);
    let stdin = io::stdin();
    let stdout = io::stdout();
    if let Err(e) = serve_stdio(&mut server, stdin.lock(), stdout.lock()) {
        eprintln!("founder-os-sovereign-mcp: stdio transport error: {e}");
        std::process::exit(1);
    }
}

/// HTTP transport — MCP JSON-RPC at `/mcp`, health at `/health`, plus legacy
/// `/mcp/v1/*` endpoints retained for backwards compatibility.
async fn run_http(server: Arc<Mutex<McpServer>>, addr: &str) {
    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/mcp", post(handle_mcp))
        .route("/mcp/v1/workflow", post(handle_legacy_workflow))
        .route("/mcp/v1/content", post(handle_legacy_content))
        .with_state(server);

    let socket: SocketAddr = addr.parse().unwrap_or_else(|e| {
        eprintln!("founder-os-sovereign-mcp: invalid --addr '{addr}': {e}");
        std::process::exit(2);
    });
    eprintln!("founder-os-sovereign-mcp http transport on http://{socket}");
    let listener = match tokio::net::TcpListener::bind(socket).await {
        Ok(l) => l,
        Err(e) => {
            eprintln!("founder-os-sovereign-mcp: bind failed: {e}");
            std::process::exit(1);
        }
    };
    axum::serve(listener, app).await.unwrap();
}

async fn handle_mcp(
    State(server): State<Arc<Mutex<McpServer>>>,
    body: String,
) -> axum::response::Response {
    let mut server = server.lock().await;
    match server.handle_json(&body) {
        Some(resp) => {
            axum::response::Response::new(axum::body::Body::new(resp))
        }
        None => axum::response::Response::builder()
            .status(axum::http::StatusCode::NO_CONTENT)
            .body(axum::body::Body::empty())
            .unwrap(),
    }
}

async fn handle_legacy_workflow(
    State(server): State<Arc<Mutex<McpServer>>>,
    Json(payload): Json<WorkflowRequest>,
) -> Json<CrmfResponse> {
    let mut server = server.lock().await;
    let seal = tools::execute_certified_workflow(payload);
    respond_with_persist(&mut server, seal)
}

async fn handle_legacy_content(
    State(server): State<Arc<Mutex<McpServer>>>,
    Json(payload): Json<ContentRequest>,
) -> Json<CrmfResponse> {
    let mut server = server.lock().await;
    respond_with_persist(&mut server, tools::execute_content_certify(payload))
}

fn respond_with_persist(
    server: &mut McpServer,
    result: Result<tools::SealedEnvelope, Vec<tools::Violation>>,
) -> Json<CrmfResponse> {
    match result {
        Ok(seal) => {
            match server.persist(&seal) {
                Ok(_) => Json(CrmfResponse {
                    status: "accepted".into(),
                    receipt_id: Some(seal.receipt_id),
                    envelope_hash: Some(seal.envelope_hash),
                    violation_vector: None,
                }),
                Err(e) => Json(CrmfResponse {
                    status: "rejected".into(),
                    receipt_id: None,
                    envelope_hash: None,
                    violation_vector: Some(vec![tools::Violation {
                        field: "ledger".into(),
                        expected: "append-only event log writable".into(),
                        actual: e,
                    }]),
                }),
            }
        }
        Err(violations) => Json(CrmfResponse {
            status: "rejected".into(),
            receipt_id: None,
            envelope_hash: None,
            violation_vector: Some(violations),
        }),
    }
}

struct Options {
    transport: String,
    state_dir: PathBuf,
    addr: String,
}

fn parse_args() -> Options {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut opts = Options {
        transport: "stdio".into(),
        state_dir: PathBuf::from(DEFAULT_STATE_DIR),
        addr: DEFAULT_ADDR.into(),
    };

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--transport" => {
                i += 1;
                if i >= args.len() {
                    die_usage();
                }
                opts.transport = args[i].clone();
            }
            "--state-dir" => {
                i += 1;
                if i >= args.len() {
                    die_usage();
                }
                opts.state_dir = PathBuf::from(&args[i]);
            }
            "--addr" => {
                i += 1;
                if i >= args.len() {
                    die_usage();
                }
                opts.addr = args[i].clone();
            }
            "-h" | "--help" => die_usage(),
            other => {
                eprintln!("founder-os-sovereign-mcp: unknown argument '{other}'");
                die_usage();
            }
        }
        i += 1;
    }
    opts
}

fn die_usage() -> ! {
    eprintln!(
        "founder-os-sovereign-mcp {}
Usage:
  founder-os-sovereign-mcp [--transport stdio] [--state-dir .state]
  founder-os-sovereign-mcp --transport http [--addr 127.0.0.1:8090] [--state-dir .state]

Transports:
  stdio  MCP JSON-RPC over stdin/stdout (default; used by Claude Desktop)
  http   JSON-RPC at POST /mcp; health at /health
",
        env!("CARGO_PKG_VERSION")
    );
    std::process::exit(2);
}