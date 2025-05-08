// db/index.js
const pgp = require('pg-promise')();
require('dotenv').config();

// Default connection string if DATABASE_URL is not in .env
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/spotifriends';

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