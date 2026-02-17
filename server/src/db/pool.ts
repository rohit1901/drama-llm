import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration from environment variables
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'drama_llm',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Create the connection pool
export const pool = new Pool(config);

// Error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Connection test
pool.on('connect', (client) => {
  console.log('New client connected to database');
});

// Helper function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Helper function to execute a query
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

// Helper function to get a client from the pool (for transactions)
export async function getClient() {
  return await pool.connect();
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}

// Export types
export type QueryResult<T = any> = pg.QueryResult<T>;
export type PoolClient = pg.PoolClient;

export default pool;
