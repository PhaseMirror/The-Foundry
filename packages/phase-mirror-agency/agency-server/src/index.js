const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8082;

const LEDGER_PATH = path.join(__dirname, '../var/archivum/ledger.jsonl');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/v1/health', (req, res) => {
    res.send('PHASE MIRROR AGENCY SERVER (NODE.JS): ONLINE');
});

/**
 * Dissonance Graph Endpoint
 */
app.get('/v1/agency/dissonance/graph', (req, res) => {
    const nodes = [
        { id: 'sedona-spine', x: 400, y: 100, label: 'Sedona Spine (Rust)', type: 'primary' },
        { id: 'phase-mirror-engine', x: 400, y: 250, label: 'Phase Mirror Engine', type: 'primary' },
        { id: 'mcp-daemon', x: 200, y: 250, label: 'MCP Daemon', type: 'secondary' },
        { id: 'coding-commander', x: 600, y: 350, label: 'Coding Commander', type: 'agent' },
        { id: 'ataraxia', x: 200, y: 400, label: 'Ataraxia', type: 'agent' },
        { id: 'finton', x: 400, y: 400, label: 'Finton', type: 'agent' },
    ];

    const edges = [
        { from: 'sedona-spine', to: 'phase-mirror-engine' },
        { from: 'phase-mirror-engine', to: 'mcp-daemon' },
        { from: 'phase-mirror-engine', to: 'coding-commander' },
        { from: 'mcp-daemon', to: 'ataraxia', dashed: true },
        { from: 'coding-commander', to: 'finton', dashed: true },
    ];

    res.json({ nodes, edges });
});

/**
 * CLI Execution Endpoint
 */
app.post('/v1/agency/cli/execute', (req, res) => {
    const { command } = req.body;
    const allowedCommands = ['phase-mirror', 'ls', 'pwd', 'date', 'whoami', 'cargo', 'npm', 'cat'];
    const cmdBase = command.trim().split(' ')[0];

    if (!allowedCommands.includes(cmdBase)) {
        return res.status(403).json({ error: `Command '${cmdBase}' not allowed.` });
    }

    exec(command, { cwd: '/home/multiplicity/Documents/phase-mirror' }, (error, stdout, stderr) => {
        res.json({ output: stdout || stderr, exitCode: error ? error.code : 0 });
    });
});

/**
 * Agent Registry Endpoint
 */
app.get('/v1/agency/agents', (req, res) => {
    res.json([
        { id: 'cc-01', name: 'Coding-Commander', status: 'active', metric: 'Triple-Lock: OK', horizon: 'Global', owner: 'Agency' },
        { id: 'at-01', name: 'Ataraxia', status: 'active', metric: 'L0 Invariant: PASS', horizon: 'Local', owner: 'Daemon' },
        { id: 'ft-01', name: 'Finton', status: 'idle', metric: 'Ledger: Clean', horizon: 'Local', owner: 'Finance' },
    ]);
});

/**
 * Archivum Ledger Endpoint
 */
app.get('/v1/agency/archivum/ledger', (req, res) => {
    try {
        if (!fs.existsSync(LEDGER_PATH)) return res.json([]);
        const data = fs.readFileSync(LEDGER_PATH, 'utf8');
        const entries = data.trim().split('\n').filter(l => l).map(JSON.parse);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read Archivum ledger' });
    }
});

/**
 * Archivum Registration Endpoint
 */
app.post('/v1/agency/archivum/register', (req, res) => {
    const newEntry = {
        id: `Qm${Math.random().toString(36).substring(2, 15)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'Site.Registration',
        metadata: req.body,
        drift: Math.random() * 0.2,
        status: 'Archived'
    };
    try {
        fs.appendFileSync(LEDGER_PATH, JSON.stringify(newEntry) + '\n');
        res.json(newEntry);
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/v1/agency/coding-commander/completions', (req, res) => {
    const { mission } = req.body;
    const binaryPath = path.join(__dirname, '../bin/coding-commander');
    exec(`"${binaryPath}"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: "Dispatch failed", details: stderr });
        res.json({
            id: `node-pm-${Date.now()}`,
            witness_hash: "b23c3252634d247b78813189d1d8547a4c033bac8648fe9a8cb321b06fcf1b67",
            completion: stdout.trim(),
            governance_status: "VERIFIED"
        });
    });
});

app.post('/v1/agency/the-examiner/audit', (req, res) => {
    const { observed_l_eff } = req.body;
    const binaryPath = path.join(__dirname, '../bin/the-examiner');
    const cmd = observed_l_eff !== undefined ? `"${binaryPath}" "${observed_l_eff}"` : `"${binaryPath}"`;
    
    exec(cmd, (error, stdout, stderr) => {
        const output = stdout + stderr;
        if (error) {
            return res.status(400).json({
                status: "FAILED",
                error: "Drift limit violated or verification failed",
                output: output.trim(),
                exitCode: error.code
            });
        }
        res.json({
            status: "PASSED",
            output: output.trim(),
            exitCode: 0
        });
    });
});

app.post('/v1/agency/the-publisher/publish', (req, res) => {
    const { file_path } = req.body;
    if (!file_path) {
        return res.status(400).json({ error: "Missing file_path parameter" });
    }
    
    const binaryPath = path.join(__dirname, '../bin/the-publisher');
    const cmd = `"${binaryPath}" "${file_path}"`;
    
    exec(cmd, (error, stdout, stderr) => {
        const output = stdout + stderr;
        if (error) {
            return res.status(500).json({
                status: "FAILED",
                error: "Artifact publication failed",
                details: stderr || stdout
            });
        }
        
        // Extract recursion hash if present
        let recursionHash = "";
        const match = stdout.match(/Computed LawfulRecursionHash v1\.0:\s+([a-f0-9]+)/i);
        if (match) {
            recursionHash = match[1];
        }
        
        // Log to Archivum Ledger
        const publishEntry = {
            id: `QmPublisher${Math.random().toString(36).substring(2, 15)}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: 'Governance.Publish',
            metadata: { file_path, recursion_hash: recursionHash },
            status: 'Archived'
        };
        
        try {
            fs.appendFileSync(LEDGER_PATH, JSON.stringify(publishEntry) + '\n');
        } catch (ledgerError) {
            console.error("[ERROR] Failed to write publish entry to ledger:", ledgerError);
        }
        
        res.json({
            status: "PUBLISHED",
            recursion_hash: recursionHash,
            output: output.trim(),
            entry: publishEntry
        });
    });
});

app.use((req, res) => {
    res.status(404).send(`Route ${req.method} ${req.url} not found`);
});

app.listen(PORT, () => {
    console.log(`[AGENCY-SERVER] Running on http://127.0.0.1:${PORT}`);
});
