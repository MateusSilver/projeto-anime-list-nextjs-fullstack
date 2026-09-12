import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// O "!" garante ao TypeScript que a variável de ambiente existe
const sql = neon(process.env.DATABASE_URL!);

// Export da instância do banco (db) para usarmos nas Server Actions depois
export const db = drizzle(sql);
