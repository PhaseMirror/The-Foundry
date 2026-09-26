import { createApp } from './routes/cli';
import { config } from './lib/config';

const app = createApp();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[AGENCY-SERVER] Running on http://127.0.0.1:${PORT}`);
  console.log(`[AGENCY-SERVER] Env: ${config.nodeEnv}`);
  console.log(`[AGENCY-SERVER] Ledger: ${config.archivum.walPath}`);
  console.log(`[AGENCY-SERVER] Binaries dir: ${config.binaries.allowedDir}`);
});

export default app;
