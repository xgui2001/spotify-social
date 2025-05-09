// db/pool.js
const { Pool } = require('pg');
require('dotenv').config();

// Serverless-friendly connection pooling
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 1, // Reduce for serverless environment
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Faster timeout for serverless
    });
    
    // Add event listeners
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
      // In serverless, we should recreate the pool on next request
      pool = null;
    });
  }
  
  return pool;
}

// Export modified query function
const query = async (text, params = []) => {
  const client = await getPool().connect();
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

module.exports = {
  query,
  getPool,
  testConnection: async () => {
    try {
      const client = await getPool().connect();
      console.log('Database connection successful');
      client.release();
      return true;
    } catch (err) {
      console.error('Database connection error:', err.message);
      return false;
    }
  }
};