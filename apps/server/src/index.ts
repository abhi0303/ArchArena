import { createApp } from './app';
import { disconnectPrisma } from './db';
import { getEnv } from './env';

const env = getEnv();
const { app, db } = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[api] HLD Arena API listening on http://localhost:${env.PORT}`);
});

// Remove expired sessions once an hour.
const cleanup = setInterval(
  () => {
    db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch((err) => console.error('[sessions] cleanup failed', err));
  },
  60 * 60 * 1000,
);
cleanup.unref();

function shutdown(signal: string) {
  console.log(`[api] ${signal} received, shutting down…`);
  server.close(() => {
    void disconnectPrisma().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
