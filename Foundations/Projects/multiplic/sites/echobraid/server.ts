import express from 'express';
import { PhaseMirrorAgent } from 'phase-mirror-agent';
// import Database from 'better-sqlite3'; // removed due to build issues
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const phaseMirrorAgent = new PhaseMirrorAgent();
  await phaseMirrorAgent.load();
  const PORT = 3000;

  // Serve health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Database functionality removed due to native build issues. This server now operates without a SQLite backend.

  // Serve frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve standard dist paths
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('/admin/index.html', (_req, res) => {
      res.redirect('/admin');
    });
    
    // Multi-entry fallback logic
    app.get(['/admin', '/admin/*all'], (req, res) => {
      res.sendFile(path.join(distPath, 'admin', 'index.html'));
    });
    
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Copilot endpoint
  app.post('/api/copilot', express.json(), async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await phaseMirrorAgent.analyze(prompt);
      res.json({ response });
    } catch (e) {
      console.error('Copilot error', e);
      res.status(500).json({ error: (e as Error).message });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
