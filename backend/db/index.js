// db/index.js
const pgp = require('pg-promise')();
require('dotenv').config();

// Default connection string if DATABASE_URL is not in .env
const connectionString = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_c9y8kTQYRHwh@ep-young-sun-a46n2ft0-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const db = pgp(connectionString);

// Test the connection
db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done(); // release the connection
  })
  .catch(error => {
    console.error('Database connection error:', error.message || error);
  });

module.exports = db;