// api/routes/tracks.js
const express = require('express');
const router = express.Router();
const { query } = require('../../db/pool');
const { authenticateToken } = require('./auth');

// Get tracks by Spotify ID or search term
router.get('/', async (req, res) => {
  try {
    const { spotifyId, search } = req.query;
    let tracks = [];
    
    if (spotifyId) {
      // Get specific track by Spotify ID
      tracks = await query(
        'SELECT * FROM tracks WHERE spotify_id = $1',
        [spotifyId]
      );
    } else if (search) {
      // Search tracks by name or artist
      tracks = await query(
        'SELECT * FROM tracks WHERE name ILIKE $1 OR artist ILIKE $1 ORDER BY name',
        [`%${search}%`]
      );
    } else {
      // Get all tracks (limited to latest 50)
      tracks = await query(
        'SELECT * FROM tracks ORDER BY created_at DESC LIMIT 50'
      );
    }
    
    res.json({ tracks });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Add a new track (ensure it exists in the database)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { spotifyId, name, artist, album, imageUrl } = req.body;
    
    if (!spotifyId || !name || !artist) {
      return res.status(400).json({ error: 'Missing required track information' });
    }
    
    // Check if track already exists
    const existingTracks = await query(
      'SELECT * FROM tracks WHERE spotify_id = $1',
      [spotifyId]
    );
    
    let track;
    
    if (existingTracks.length > 0) {
      // Track exists, return it
      track = existingTracks[0];
    } else {
      // Create new track
      const newTracks = await query(
        'INSERT INTO tracks (spotify_id, name, artist, album, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [spotifyId, name, artist, album || null, imageUrl || null]
      );
      
      track = newTracks[0];
    }
    
    res.status(201).json({ track });
  } catch (error) {
    console.error('Error adding track:', error);
    res.status(500).json({ error: 'Failed to add track' });
  }
});

// Get likes for a track
router.get('/:trackId/likes', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Verify if trackId is a number or a Spotify ID
    let track;
    if (isNaN(trackId)) {
      // It's a Spotify ID
      const tracks = await query('SELECT * FROM tracks WHERE spotify_id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    } else {
      // It's a database ID
      const tracks = await query('SELECT * FROM tracks WHERE id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    }
    
    // Get likes with user info
    const likes = await query(`
      SELECT l.id, l.created_at, u.id as user_id, u.username, u.profile_image 
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.track_id = $1
      ORDER BY l.created_at DESC
    `, [track.id]);
    
    res.json({ likes, track });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// Add a like to a track
router.post('/:trackId/likes', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.userId;
    
    // Find track by ID or Spotify ID
    let track;
    if (isNaN(trackId)) {
      // It's a Spotify ID
      const tracks = await query('SELECT * FROM tracks WHERE spotify_id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    } else {
      // It's a database ID
      const tracks = await query('SELECT * FROM tracks WHERE id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    }
    
    // Check if like already exists
    const existingLikes = await query(
      'SELECT * FROM likes WHERE user_id = $1 AND track_id = $2',
      [userId, track.id]
    );
    
    if (existingLikes.length > 0) {
      return res.status(400).json({ error: 'You already liked this track' });
    }
    
    // Add new like
    const result = await query(
      'INSERT INTO likes (user_id, track_id) VALUES ($1, $2) RETURNING id, created_at',
      [userId, track.id]
    );
    
    res.status(201).json({ 
      message: 'Like added successfully',
      like: result[0]
    });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ error: 'Failed to add like' });
  }
});

// Remove a like from a track
router.delete('/:trackId/likes', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.userId;
    
    // Find track by ID or Spotify ID
    let track;
    if (isNaN(trackId)) {
      // It's a Spotify ID
      const tracks = await query('SELECT * FROM tracks WHERE spotify_id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    } else {
      // It's a database ID
      const tracks = await query('SELECT * FROM tracks WHERE id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    }
    
    // Remove the like
    const result = await query(
      'DELETE FROM likes WHERE user_id = $1 AND track_id = $2 RETURNING id',
      [userId, track.id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }
    
    res.json({ 
      message: 'Like removed successfully'
    });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
});

// Get comments for a track
router.get('/:trackId/comments', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Find track by ID or Spotify ID
    let track;
    if (isNaN(trackId)) {
      // It's a Spotify ID
      const tracks = await query('SELECT * FROM tracks WHERE spotify_id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    } else {
      // It's a database ID
      const tracks = await query('SELECT * FROM tracks WHERE id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    }
    
    // Get comments with user info
    const comments = await query(`
      SELECT c.id, c.content, c.created_at, u.id as user_id, u.username, u.profile_image 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.track_id = $1
      ORDER BY c.created_at DESC
    `, [track.id]);
    
    res.json({ comments, track });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a track
router.post('/:trackId/comments', authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.userId;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Find track by ID or Spotify ID
    let track;
    if (isNaN(trackId)) {
      // It's a Spotify ID
      const tracks = await query('SELECT * FROM tracks WHERE spotify_id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    } else {
      // It's a database ID
      const tracks = await query('SELECT * FROM tracks WHERE id = $1', [trackId]);
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'Track not found' });
      }
      track = tracks[0];
    }
    
    // Add new comment
    const result = await query(
      'INSERT INTO comments (user_id, track_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [userId, track.id, content]
    );
    
    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: {
        id: result[0].id,
        created_at: result[0].created_at,
        content
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;