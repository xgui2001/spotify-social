// Spotify API service for playback features

export const spotifyService = {
  // Play a track
  playTrack: async (trackUri) => {
    try {
      // Format the track URI if needed
      let formattedUri = trackUri;
      if (!trackUri.startsWith('spotify:track:')) {
        if (trackUri.includes('/track/')) {
          const trackId = trackUri.split('/track/')[1].split('?')[0];
          formattedUri = `spotify:track:${trackId}`;
        } else {
          formattedUri = `spotify:track:${trackUri}`;
        }
      }
      
      console.log('Playing track:', formattedUri);
      
      // Option 1: Open the track in Spotify
      window.open(`https://open.spotify.com/track/${formattedUri.split(':')[2]}`, '_blank');
      
      return { success: true };
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  },
  
  // Get friend activity (keep this if you're using it)
  getFriendActivity: async () => {
    // Your existing friend activity code
  }
};