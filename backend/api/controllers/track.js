const { query } = require('../../db/pool');

// Find a track by ID or Spotify ID
async function findTrack(trackId) {
  let track;
  
  if (isNaN(trackId)) {
    // It's a Spotify ID
    const tracks = await query('SELECT * FROM tracks WHERE spotify_id = $1', [trackId]);
    if (tracks.length === 0) {
      throw { status: 404, message: 'Track not found' };
    }
    track = tracks[0];
  } else {
    // It's a database ID
    const tracks = await query('SELECT * FROM tracks WHERE id = $1', [trackId]);
    if (tracks.length === 0) {
      throw { status: 404, message: 'Track not found' };
    }
    track = tracks[0];
  }
  
  return track;
}

// Get tracks with pagination
async function getTracks(options = {}) {
  const { spotifyId, search, page = 1, limit = 50 } = options;
  const offset = (page - 1) * limit;
  
  let tracks = [];
  let count = 0;
  
  if (spotifyId) {
    // Get specific track by Spotify ID
    tracks = await query(
      'SELECT * FROM tracks WHERE spotify_id = $1',
      [spotifyId]
    );
    count = tracks.length;
  } else if (search) {
    // Search tracks by name or artist
    tracks = await query(
      'SELECT * FROM tracks WHERE name ILIKE $1 OR artist ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3',
      [`%${search}%`, limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) FROM tracks WHERE name ILIKE $1 OR artist ILIKE $1',
      [`%${search}%`]
    );
    count = parseInt(countResult[0].count);
  } else {
    // Get all tracks with pagination
    tracks = await query(
      'SELECT * FROM tracks ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) FROM tracks');
    count = parseInt(countResult[0].count);
  }
  
  return {
    tracks,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    }
  };
}

// Add or get a track
async function addTrack(trackData) {
  const { spotifyId, name, artist, album, imageUrl } = trackData;
  
  // Validate required fields
  if (!spotifyId || !name || !artist) {
    throw { status: 400, message: 'Missing required track information' };
  }
  
  // Check if track already exists
  const existingTracks = await query(
    'SELECT * FROM tracks WHERE spotify_id = $1',
    [spotifyId]
  );
  
  if (existingTracks.length > 0) {
    // Track exists, return it
    return existingTracks[0];
  }
  
  // Create new track
  const newTracks = await query(
    'INSERT INTO tracks (spotify_id, name, artist, album, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [spotifyId, name, artist, album || null, imageUrl || null]
  );
  
  return newTracks[0];
}

// Get track likes
async function getTrackLikes(trackId) {
  const track = await findTrack(trackId);
  
  // Get likes with user info
  const likes = await query(`
    SELECT l.id, l.created_at, u.id as user_id, u.username, u.profile_image 
    FROM likes l
    JOIN users u ON l.user_id = u.id
    WHERE l.track_id = $1
    ORDER BY l.created_at DESC
  `, [track.id]);
  
  return { likes, track };
}

// Add like to track
async function addLike(trackId, userId) {
  const track = await findTrack(trackId);
  
  try {
    // Check if like already exists
    const existingLikes = await query(
      'SELECT * FROM likes WHERE user_id = $1 AND track_id = $2',
      [userId, track.id]
    );
    
    if (existingLikes.length > 0) {
      throw { status: 409, message: 'You already liked this track' };
    }
    
    // Add new like
    const result = await query(
      'INSERT INTO likes (user_id, track_id) VALUES ($1, $2) RETURNING id, created_at',
      [userId, track.id]
    );
    
    return {
      message: 'Like added successfully',
      like: result[0]
    };
  } catch (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      throw { status: 409, message: 'You already liked this track' };
    }
    throw error;
  }
}

// Remove like from track
async function removeLike(trackId, userId) {
  const track = await findTrack(trackId);
  
  // Remove the like
  const result = await query(
    'DELETE FROM likes WHERE user_id = $1 AND track_id = $2 RETURNING id',
    [userId, track.id]
  );
  
  if (result.length === 0) {
    throw { status: 404, message: 'Like not found' };
  }
  
  return { message: 'Like removed successfully' };
}

// Get user likes
async function getUserLikes(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Get tracks liked by user with pagination
    const likedTracks = await query(`
      SELECT t.*, l.created_at as liked_at
      FROM tracks t
      JOIN likes l ON t.id = l.track_id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) FROM likes WHERE user_id = $1',
      [userId]
    );
    const count = parseInt(countResult[0].count);
    
    return {
      tracks: likedTracks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
  }

// Check if user has liked a track
async function hasUserLikedTrack(userId, trackId) {
  const track = await findTrack(trackId);
  
  const result = await query(
    'SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND track_id = $2)',
    [userId, track.id]
  );
  
  return { liked: result[0].exists };
}

module.exports = {
  findTrack,
  getTracks,
  addTrack,
  getTrackLikes,
  addLike,
  removeLike,
  getUserLikes,
  hasUserLikedTrack
};