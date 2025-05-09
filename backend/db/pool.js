// db/pool.js
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool with proper SSL config for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5, // limit concurrent connections
  idleTimeoutMillis: 30000, // close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // timeout after 10 seconds
});

// Add event listeners for connection issues
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Export a simplified query function
const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Check connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return false;
  }
};

// Export functions
module.exports = {
  query,
  pool,
  testConnection
};