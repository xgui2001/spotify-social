// api/simple-auth.js
const express = require('express');
const router = express.Router();

// Hardcoded credentials and redirect URI
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; 
const REDIRECT_URI = 'https://spotify-backend-88gdyc6hh-angelas-projects-c3d72215.vercel.app/api/simple-auth/callback';

/**
 * Simple test route for Spotify auth
 */
router.get('/login', (req, res) => {
  console.log('Simple auth login route accessed');
  
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

/**
 * Simple callback route
 */
router.get('/callback', (req, res) => {
  console.log('Simple auth callback accessed with query params:', req.query);
  
  // Just display the params for debugging
  res.send(`
    <h1>Auth Callback Received</h1>
    <pre>${JSON.stringify(req.query, null, 2)}</pre>
    <p>Check your server logs for more details.</p>
  `);
});

// Make sure this line is present
module.exports = router;