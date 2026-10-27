interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  APP_ENV?: string;
  DEMO_MODE?: string;
}

declare namespace NodeJS {
  interface ProcessEnv { SESSION_SECRET?: string; APP_ENV?: string; }
}
