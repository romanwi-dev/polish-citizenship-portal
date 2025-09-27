import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard PostgreSQL connection with improved settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon') ? { rejectUnauthorized: false } : false,
  max: 20, // Increased max connections
  idleTimeoutMillis: 60000, // Increased idle timeout to 60 seconds
  connectionTimeoutMillis: 10000, // Increased connection timeout to 10 seconds
  keepAlive: true, // Enable keep-alive
  keepAliveInitialDelayMillis: 10000, // Keep-alive delay
});

// Test the connection on startup
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Ensure we can connect
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring database client:', err.stack);
  } else {
    console.log('Database connection pool initialized successfully');
    release();
  }
});

export const db = drizzle(pool, { schema });