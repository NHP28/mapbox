import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const queryClient = postgres(connectionString, {
  prepare: false,
  max: 5,
});

export const db = drizzle(queryClient);
