const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Add these routes directly to your index.js
app.get('/api/test-auth/login', (req, res) => {
  console.log('Test auth login route accessed');
  
  // Hardcoded credentials and redirect URI
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = 'https://spotify-backend-88gdyc6hh-angelas-projects-c3d72215.vercel.app/api/test-auth/callback';
  
  // Generate a simple state
  const state = Math.random().toString(36).substring(2, 15);
  
  // Construct a minimal auth URL
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
  authUrl.searchParams.append('scope', 'user-read-email');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('state', state);
  
  console.log('Redirecting to:', authUrl.toString());
  
  // Redirect to Spotify
  res.redirect(authUrl.toString());
});

app.get('/api/test-auth/callback', (req, res) => {
  console.log('Test auth callback accessed with query params:', req.query);
  
  // Just display the params for debugging
  res.send(`
    <h1>Auth Callback Received</h1>
    <pre>${JSON.stringify(req.query, null, 2)}</pre>
    <p>Check your server logs for more details.</p>
  `);
});

// Routes (we'll create these next)
app.use('/api/auth', require('./api/routes/auth'));
app.use('/api/tracks', require('./api/routes/tracks'));
// Add this line to your existing routes
app.use('/api/simple-auth', require('./api/simple-auth'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});