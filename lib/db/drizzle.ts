import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Configure postgres-js for serverless environments
const connectionString = process.env.POSTGRES_URL;

// Optimize for serverless/edge environments
export const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for better serverless compatibility
  max: 1, // Limit connections in serverless environments
  idle_timeout: 20, // Close idle connections quickly
  max_lifetime: 60 * 30, // 30 minutes
});

export const db = drizzle(client, { schema });
