// index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Load database connection and test it on startup
const { testConnection } = require('./db/pool');

// Initialize database connection
testConnection().then(success => {
  if (success) {
    console.log('Database connection successful!');
  } else {
    console.warn('Database connection failed! App will continue but database features may not work.');
  }
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Chrome extension
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Debug route to list all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  // Extract routes from Express app
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: middleware.regexp.toString().includes('/api') 
              ? `/api${handler.route.path}` 
              : handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({ routes });
});

// Import routes from auth module
const { router: authRouter } = require('./api/routes/auth');
const tracksRouter = require('./api/routes/tracks');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tracks', tracksRouter);

// Simple root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Spotifriends API',
    endpoints: [
      '/api/health',
      '/api/routes',
      '/api/auth/login',
      '/api/tracks'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});