import React, { useState, useEffect, useRef} from "react";
import "./App.css";
import { useFriendActivity } from "./hooks/useFriendActivity";
import Login from "./Login";
import { trackService } from "./api/trackService";

// Simple SVG Icon components
const HeartIcon = ({ active, onClick }) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill={active ? "#1DB954" : "none"} 
    stroke={active ? "#1DB954" : "#a7a7a7"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ cursor: "pointer" }}
    onClick={onClick}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.74-4.5 2.05A5.5 5.5 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// Play Icon component
const PlayIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#a7a7a7" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ cursor: "pointer" }}
  >
    <polygon points="5 3 19 12 5 21 5 3" fill="#a7a7a7" stroke="none" />
  </svg>
);

// Utility: format seconds into human-readable time
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "Unknown";
  
  const durations = [
    { unit: "min", value: 60 },
    { unit: "hr", value: 60 },
    { unit: "d", value: 24 },
    { unit: "w", value: 7 },
  ];
  for (let i = 0; i < durations.length - 1; i++) {
    seconds = Math.round(seconds / durations[i].value);
    if (seconds < durations[i + 1].value) {
      return `${seconds} ${durations[i].unit}`;
    }
  }
  return `${Math.round(seconds / durations.at(-1).value)} ${durations.at(-1).unit}`;
}


// UI Component: Friend activity card
const FriendCard = ({ friend }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Add default values to prevent undefined errors
  const { 
    online = false, 
    contextName = "", 
    contextType = "", 
    contextUrl = "#", 
    trackUrl = "#", 
    profileImage = null,
    name = "Unknown Friend",
    track = "Unknown Track",
    artist = "Unknown Artist",
    secondsAgo = 0,
    trackId = "" // Add trackId for play functionality
  } = friend || {};

  // Extract track Spotify ID from URI or URL
  const getSpotifyId = (uri) => {
    if (!uri) return null;
    
    // Handle both URI and URL formats
    if (uri.includes('spotify:track:')) {
      return uri.split('spotify:track:')[1];
    } else if (uri.includes('/track/')) {
      return uri.split('/track/')[1].split('?')[0];
    }
    return null;
  };
  
  const spotifyId = getSpotifyId(trackUrl);
  const trackUri = spotifyId ? `spotify:track:${spotifyId}` : null;

  // Add refs for text elements that might need marquee
  const trackTextRef = useRef(null);
  const contextTextRef = useRef(null);

  // Function to play the track
  const handlePlayTrack = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Get track ID from trackUrl or trackId
    let spotifyTrackId = trackId;
    if (!spotifyTrackId && trackUrl && trackUrl.includes('/track/')) {
      spotifyTrackId = trackUrl.split('/track/')[1].split('?')[0];
    }
    
    if (spotifyTrackId) {
      window.open(`https://open.spotify.com/track/${spotifyTrackId}`, '_blank');
    } else {
      // If we can't extract ID, just use the trackUrl
      window.open(trackUrl, '_blank');
    }
  };

  // Check for text overflow and add class if needed
  useEffect(() => {
    const checkOverflow = (element) => {
      if (element) {
        const span = element.querySelector('span');
        if (span && span.scrollWidth > element.clientWidth) {
          element.classList.add('overflow');
        } else if (span) {
          element.classList.remove('overflow');
        }
      }
    };

    checkOverflow(trackTextRef.current);
    checkOverflow(contextTextRef.current);
  }, [track, artist, contextName, contextType]); // Re-check when content changes

  // Load likes when component mounts
  useEffect(() => {
    if (spotifyId) {
      // Load likes
      trackService.getTrackLikes(spotifyId)
        .then(data => {
          setLikeCount(data.likes?.length || 0);
          // Check if current user has liked
          const token = localStorage.getItem('spotifyAuthToken');
          if (token) {
            const userData = JSON.parse(localStorage.getItem('spotifySocialUser') || '{}');
            const userId = userData.id;
            setLiked(data.likes?.some(like => like.user_id === userId) || false);
          }
        })
        .catch(err => console.error("Error loading likes:", err));
    }
  }, [spotifyId]);

  // Handle like click
  const handleLikeClick = async () => {
    if (!spotifyId) return;
    
    try {
      if (liked) {
        await trackService.unlikeTrack(spotifyId);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // First ensure track exists in database
        await trackService.ensureTrackExists({
          spotifyId,
          name: track,
          artist,
          album: contextType === 'album' ? contextName : '',
          imageUrl: ''
        });
        
        await trackService.likeTrack(spotifyId);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        margin: "10px auto",
        padding: "16px 16px 48px 16px",
        borderRadius: "10px", // Rounded corners for cards
        border: "1px solid rgba(40, 40, 40, 0.7)",
        backgroundColor: "rgba(30, 30, 30, 0.5)",
        width: "95%",
        maxWidth: "340px",
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "background-color 0.3s ease, transform 0.2s ease",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#1f1f1f";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(30, 30, 30, 0.5)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
      }}
    >
      {/* Profile image container */}
      <div
        style={{
          width: 40,
          height: 40,
          position: "absolute",
          left: 16,
          top: 16,
        }}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt="profile"
            style={{
              borderRadius: "50%",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://i.scdn.co/image/ab6775700000ee85b5d374d281b9e510a7b9503b";
            }}
          />
        ) : (
          <div
            style={{
              borderRadius: "50%",
              width: "100%",
              height: "100%",
              backgroundColor: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                fill="#999"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Right side content (textual info) */}
      <div style={{ marginLeft: 56, overflow: "hidden" }}>
        {/* Top row: Name and time ago */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          {/* Friend name */}
          <span style={{ fontSize: 14, fontWeight: 600, color: "#dddddd" }}>
            {name}
          </span>
          {/* Time ago or online */}
          <span style={{ fontSize: 13, color: "#a7a7a7" }}>
            {online ? "Online" : formatTime(secondsAgo)}
          </span>
        </div>

        {/* Track and artist info */}
        <div
          ref={trackTextRef}
          style={{
            fontSize: 14,
            color: "#dddddd",
            textAlign: "left",
            marginBottom: 4,
          }}
          className="marquee-text"
        >
          <span>
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#dddddd", textDecoration: "none" }}
            >
              {track} • {artist}
            </a>
          </span>
        </div>

        {/* Context link (playlist/album/etc.) */}
        <div 
          ref={contextTextRef}
          style={{ display: "flex", alignItems: "center", marginTop: 4 }}
          className="marquee-text"
        >
          <span style={{ fontSize: 12, color: "#a7a7a7" }}>
            <a
              href={contextUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#a7a7a7", textDecoration: "none" }}
            >
              {contextName || contextType || "Unknown Context"}
            </a>
          </span>
        </div>
      </div>

      {/* Bottom right action buttons */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          gap: 16,
          alignItems: "center"
        }}
      >
        <div onClick={handlePlayTrack}>
          <PlayIcon />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <HeartIcon active={liked} onClick={handleLikeClick} />
          {likeCount > 0 && (
            <span style={{ fontSize: 12, color: liked ? "#1DB954" : "#a7a7a7" }}>
              {likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function FriendActivityFeed({ username }) {
  // Add default empty array for friendActivity
  const { friendActivity = [], loading, error } = useFriendActivity() || {};

  return (
    <div
      style={{
        background: "#121212",
        color: "#fff",
        width: "100%",
        height: "100%",
        fontFamily: "Montserrat, sans-serif",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px", // Add rounded corners to main container
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)" // Add shadow to the container
      }}
    >
      {/* Fixed Header - Left aligned with user info */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between", 
          alignItems: "center",
          width: "100%",
          borderBottom: "1px solid rgba(40, 40, 40, 0.7)",
          position: "sticky",
          top: 0,
          background: "#121212",
          zIndex: 10,
          paddingLeft: "24px",
          borderTopLeftRadius: "12px", // Round top corners
          borderTopRightRadius: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>Friend Activity</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#a7a7a7", marginRight: 8 }}>
            {username}
          </span>
<div 
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "50%",
    transition: "background-color 0.2s ease"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = "transparent";
  }}
  onClick={() => {
    localStorage.removeItem("spotifySocialUser");
    window.location.reload();
  }}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a7a7a7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
</div>
        </div>
      </div>

      {/* Scrollable Content - hidden scrollbar class */}
      <div 
        style={{
          overflowY: "auto",
          maxHeight: "calc(600px - 53px)",
          width: "100%",
          msOverflowStyle: "none", /* IE and Edge */
          scrollbarWidth: "none", /* Firefox */
          paddingBottom: "12px"
        }}
      >
        {/* Hide scrollbar for Chrome, Safari and Opera */}
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        
        {loading ? (
          <p style={{ padding: 16, color: "#aaa", textAlign: "center", animation: "pulse 1.5s infinite ease-in-out" }}>
            Loading friend activity…
          </p>
        ) : error ? (
          <p style={{ padding: 16, color: "#ff4d4f", textAlign: "center" }}>
            {error}
          </p>
        ) : !friendActivity || friendActivity.length === 0 ? (
          <p style={{ padding: 16, color: "#aaa", textAlign: "center" }}>
            No friend activity right now. Make sure Spotify is open and Friend Activity is enabled.
          </p>
        ) : (
          // Add null check and provide a key fallback
          friendActivity.map((friend) => <FriendCard key={friend?.id || Math.random().toString()} friend={friend} />)
        )}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem("spotifySocialUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("spotifySocialUser");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (isLoading) {
    return (
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          height: "100vh",
          background: "#121212",
          color: "#fff",
          borderRadius: "12px",
          overflow: "hidden"
        }}
      >
        <div style={{ animation: "pulse 1.5s infinite ease-in-out" }}>Loading...</div>
      </div>
    );
  }

  return user ? <FriendActivityFeed username={user.username} /> : <Login onLogin={handleLogin} />;
}

export default App;