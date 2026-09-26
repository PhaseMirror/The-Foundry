import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Example database implementation using better-sqlite3
  // This demonstrates to the user how they can integrate their requested better-sqlite3 dependency
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.get('/api/admin/logs', (req, res) => {
    try {
      const logs = db.prepare('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 50').all();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/admin/logs', express.json(), (req, res) => {
    try {
      const { message } = req.body;
      const stmt = db.prepare('INSERT INTO admin_logs (message) VALUES (?)');
      stmt.run(message || 'Ping registered');
      res.json({ status: 'Log added' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });


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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
