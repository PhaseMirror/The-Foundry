# Justfile Graph Dashboard

This prototype is a static React + Tailwind dashboard that parses a Justfile, renders a dependency graph, supports drag-and-drop upload, simulates backend-triggered recipe execution with live logs, and monitors dependency complexity in real time.[web:75][web:73]

## Included features

- Parse recipes, descriptions, parameters, and dependencies from a Justfile.[web:73][web:75]
- Render an interactive dependency graph in the browser, with arrows flowing from dependency to dependent recipe.[web:73]
- Provide a drag-and-drop file upload flow so users can visualize their own Justfiles instantly.
- Simulate a backend execution API and stream live log updates in the dashboard.
- Re-parse on edit and refresh a D3 mini-monitor view.
- Flag depth-threshold alerts and circular references when detected.[web:75][web:91]

## Production notes

This prototype uses a custom SVG graph plus a D3 monitor instead of React Flow because it is delivered as one self-contained static HTML artifact. In a production app, the graph view can be swapped for React Flow and the simulated execution hook can be replaced with a real backend route such as `POST /api/run` plus SSE or WebSocket log streaming.

A practical production stack would be:

- React + Tailwind frontend
- React Flow for node editing and pan/zoom
- Backend service that runs approved recipes only
- File watcher on the Justfile using chokidar or a similar watcher
- Alert logic for cycle detection and excessive dependency depth
