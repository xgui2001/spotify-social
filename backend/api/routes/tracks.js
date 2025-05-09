// api/routes/tracks.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const trackController = require('../controllers/track');
const { query } = require('../../db/pool');

// Middleware for track finding
const findTrackMiddleware = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const track = await trackController.findTrack(trackId);
    req.track = track;
    next();
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Server error' });
  }
};

// Get tracks by Spotify ID or search term with pagination
router.get('/', async (req, res) => {
  try {
    const { spotifyId, search, page, limit } = req.query;
    const result = await trackController.getTracks({ spotifyId, search, page, limit });
    res.json(result);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to fetch tracks' });
  }
});

// Add a new track (ensure it exists in the database)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const track = await trackController.addTrack(req.body);
    res.status(201).json({ track });
  } catch (error) {
    console.error('Error adding track:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to add track' });
  }
});

// Get all likes by a user - MOVED UP before :trackId routes
router.get('/user/likes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    
    const result = await trackController.getUserLikes(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user likes:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to fetch user likes' });
  }
});

// Get likes for a track
router.get('/:trackId/likes', findTrackMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;
    const result = await trackController.getTrackLikes(trackId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching likes:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to fetch likes' });
  }
});

// Add a like to a track
router.post('/:trackId/likes', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.userId;
    
    const result = await trackController.addLike(trackId, userId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding like:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to add like' });
  }
});

// Remove a like from a track
router.delete('/:trackId/likes', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.userId;
    
    const result = await trackController.removeLike(trackId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error removing like:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to remove like' });
  }
});

// Check if user has liked a track
router.get('/:trackId/liked', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.userId;
    
    const result = await trackController.hasUserLikedTrack(userId, trackId);
    res.json(result);
  } catch (error) {
    console.error('Error checking like status:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to check like status' });
  }
});

module.exports = router;