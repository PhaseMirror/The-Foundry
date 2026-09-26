# Phase Mirror Discord Bot (Overhauled)

The Phase Mirror Discord Bot provides a real-time gateway for governance monitoring and architectural validation directly from Discord. It is powered by the **Phase Mirror Agency Server** and the **Sedona Spine** (Rust Engine).

## Features

- **MissionProtocol Integration**: Dispatch missions to the Coding Commander via `/mission`.
- **Triple-Lock Validation**: Every response includes a deterministic `witness_hash` and `governance_status`.
- **Live Status Monitoring**: Check the health of the Agency and Sedona Spine via `/agency-status`.
- **Dissonance Audits**: Trigger `/dissonance` checks via the MCP audit layer.

## Setup

1.  **Configure Environment**: Copy `.env.example` to `.env` and provide your `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, and `DISCORD_ALLOWED_GUILDS`.
2.  **Agency Server**: Ensure the Agency Server is running on `http://127.0.0.1:8082`.
3.  **Install & Run**:
    ```bash
    npm install
    npm run start
    ```

## Slash Commands

- `/mission <input>`: Dispatch a mission to the Agency.
- `/agency-status`: Display current health of the governance fleet.
- `/verify-adr <id>`: Validate an Architectural Decision Record.
- `/dissonance`: Run a system-wide dissonance audit.

## Lawful Recursion
This bot strictly adheres to the **Sedona Spine Mandate**. No governance logic is computed within the bot; it acts solely as a verified proxy for the Cold Machine.
