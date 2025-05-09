// Track service for social features
const API_BASE_URL = 'https://spotify-backend-eta.vercel.app/api';

// Helper for making authenticated requests
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('spotifyAuthToken');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  return response.json();
}

export const trackService = {
  // Ensure track exists in database
  ensureTrackExists: async (trackData) => {
    try {
      if (!trackData.spotifyId) {
        throw new Error('Track ID is required');
      }
      
      return await fetchWithAuth('/tracks', {
        method: 'POST',
        body: JSON.stringify({
          spotifyId: trackData.spotifyId,
          name: trackData.name || 'Unknown Track',
          artist: trackData.artist || 'Unknown Artist',
          album: trackData.album || '',
          imageUrl: trackData.imageUrl || ''
        })
      });
    } catch (error) {
      console.error("Error ensuring track exists:", error);
      // Continue even if this fails - the track might already exist
      return { success: false, error: error.message };
    }
  },
  
  // Like a track
  likeTrack: async (spotifyId) => {
    try {
      // First ensure the track exists
      await trackService.ensureTrackExists({ spotifyId });
      
      return await fetchWithAuth(`/tracks/${spotifyId}/likes`, {
        method: 'POST'
      });
    } catch (error) {
      // If already liked, don't treat as error
      if (error.message?.includes('already liked')) {
        return { success: true, message: 'Track already liked' };
      }
      throw error;
    }
  },
  
  // Unlike a track
  unlikeTrack: async (spotifyId) => {
    return fetchWithAuth(`/tracks/${spotifyId}/likes`, {
      method: 'DELETE'
    });
  },
  
  // Get likes for a track
  getTrackLikes: async (spotifyId) => {
    try {
      // First ensure the track exists
      await trackService.ensureTrackExists({ spotifyId });
      
      // Then try to get likes with authentication
      return await fetchWithAuth(`/tracks/${spotifyId}/likes`);
    } catch (error) {
      console.error("Error getting track likes:", error);
      return { likes: [] };
    }
  },
  
  

};

export default trackService;