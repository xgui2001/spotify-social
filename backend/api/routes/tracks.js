const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get likes for a track
router.get('/:trackId/likes', (req, res) => {
  const { trackId } = req.params;
  
  // Placeholder - normally would fetch from database
  res.json({ 
    likes: [
      // Sample data until database is connected
      { id: 1, username: 'Sample User', created_at: new Date().toISOString() }
    ] 
  });
});

// Add a like to a track
router.post('/:trackId/likes', authenticateToken, (req, res) => {
  const { trackId } = req.params;
  const userId = req.user.spotifyUserId;
  
  // Placeholder - normally would store in database
  res.status(201).json({ 
    message: 'Like added successfully',
    trackId,
    userId
  });
});

// Get comments for a track
router.get('/:trackId/comments', (req, res) => {
  const { trackId } = req.params;
  
  // Placeholder - normally would fetch from database
  res.json({ 
    comments: [
      // Sample data until database is connected
      { 
        id: 1, 
        username: 'Sample User', 
        content: 'Great track!',
        created_at: new Date().toISOString() 
      }
    ] 
  });
});

// Add a comment to a track
router.post('/:trackId/comments', authenticateToken, (req, res) => {
  const { trackId } = req.params;
  const userId = req.user.spotifyUserId;
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  // Placeholder - normally would store in database
  res.status(201).json({ 
    message: 'Comment added successfully',
    commentId: Math.floor(Math.random() * 1000),
    trackId,
    userId
  });
});

module.exports = router;