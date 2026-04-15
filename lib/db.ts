import { Pool, PoolConfig, type QueryResultRow } from "pg";
import { env } from "@/lib/env";

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
};

declare global {
  var pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool(poolConfig);
} else {
  if (!global.pgPool) {
    global.pgPool = new Pool(poolConfig);
  }
  pool = global.pgPool;
}

export const poolInstance = pool;

export const db = {
  query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) =>
    poolInstance.query<T>(text, params),
  connect: () => poolInstance.connect(),
};

export default db;
