import path from 'node:path';
import { existsSync } from 'node:fs';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { attachUser } from './auth/sessions';
import { getPrisma, type Db } from './db';
import { getEnv } from './env';
import { errorHandler, notFoundHandler } from './http/errors';
import { originCheck } from './http/security';
import { attemptsRouter } from './routes/attempts';
import { authRouter } from './routes/auth';
import { draftsRouter } from './routes/drafts';
import { meRouter } from './routes/me';
import { questionsRouter } from './routes/questions';
import { submissionsRouter } from './routes/submissions';
import { QuestionStore } from './services/questionStore';

export interface AppDeps {
  db?: Db;
  store?: QuestionStore;
}

export function createApp(deps: AppDeps = {}): { app: Express; db: Db; store: QuestionStore } {
  const env = getEnv();
  const db = deps.db ?? getPrisma();
  const store = deps.store ?? new QuestionStore(db);
  const app = express();

  app.disable('x-powered-by');
  if (env.BEHIND_PROXY) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.WEB_DIST_DIR
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", 'https://accounts.google.com'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: ["'self'", 'data:', 'https://*.googleusercontent.com'],
              connectSrc: ["'self'", 'https://accounts.google.com'],
              frameSrc: ['https://accounts.google.com'],
              workerSrc: ["'self'"],
              manifestSrc: ["'self'"],
              // Only force HTTPS sub-resources when TLS is actually terminated in front of the app.
              upgradeInsecureRequests: env.BEHIND_PROXY ? [] : null,
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api', originCheck, attachUser(db));

  app.get('/api/health', async (_req, res) => {
    let database = false;
    try {
      await db.$queryRaw`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }
    res.status(database ? 200 : 503).json({ ok: database, database });
  });

  app.use('/api/auth', authRouter(db));
  app.use('/api/questions', questionsRouter(db, store));
  app.use('/api/me', meRouter(db, store));
  app.use('/api/drafts', draftsRouter(db, store));
  app.use('/api/attempts', attemptsRouter(db, store));
  app.use('/api/submissions', submissionsRouter(db, store));
  app.use('/api', notFoundHandler);

  // Optional: serve the built single-page app from the same origin.
  if (env.WEB_DIST_DIR) {
    const dist = path.resolve(env.WEB_DIST_DIR);
    if (!existsSync(path.join(dist, 'index.html'))) {
      console.warn(`[web] WEB_DIST_DIR=${dist} has no index.html; run "npm run build" first.`);
    }
    app.use(
      express.static(dist, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    app.use((req, res, next) => {
      if ((req.method !== 'GET' && req.method !== 'HEAD') || !req.accepts('html')) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return { app, db, store };
}
