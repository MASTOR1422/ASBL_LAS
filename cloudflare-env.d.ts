interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}
interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  APP_ENV?: string;
  DEMO_MODE?: string;
}
declare namespace NodeJS { interface ProcessEnv { SESSION_SECRET?: string; APP_ENV?: string; } }
