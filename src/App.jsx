import React from "react";
import "./App.css";
import { useFriendActivity } from "./hooks/useFriendActivity";

// Utility: format seconds into human-readable time (already included in hook)
function formatTime(seconds) {
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
  const { online, contextName, contextType, contextUrl, trackUrl, profileImage } = friend;

  return (
    // Container for each friend's card
    <div style={{
      position: "relative",
      margin: "8px 12px", // spacing around each card
      padding: "16px 16px 40px 16px", // inner spacing
      borderRadius: "8px", // rounded corners
      border: "1px solid rgba(40, 40, 40, 0.7)", // border styling
      backgroundColor: "rgba(30, 30, 30, 0.5)" // translucent dark background
    }}
    
onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(30,30,30,0.5)")}
    >

      {/* Profile image container */}
      <div style={{ width: 40, height: 40, position: "absolute", left: 16, top: 16 }}>
        {profileImage ? (
          <img
            src={profileImage}
            alt="profile"
            style={{ borderRadius: "50%", width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          // Fallback icon if profile image is missing
          <div style={{
            borderRadius: "50%",
            width: "100%",
            height: "100%",
            backgroundColor: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#999" />
            </svg>
          </div>
        )}
      </div>

      {/* Right side content (textual info) */}
      <div style={{ marginLeft: 56, overflow: "hidden" }}>
        {/* Top row: Name and time ago */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          {/* Friend name */}
          <span style={{ fontSize: 14, fontWeight: 600, color: "#dddddd" }}>{friend.name}</span>
          {/* Time ago or online */}
          <span style={{ fontSize: 13, color: "#a7a7a7" }}>
            {online ? "Online" : formatTime(friend.secondsAgo)}
          </span>
        </div>

        {/* Track and artist info */}
        <div style={{ fontSize: 14, color: "#dddddd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left", marginBottom: 4 }}>
          <a href={trackUrl} target="_blank" style={{ color: "#dddddd", textDecoration: "none" }}>
            {friend.track} • {friend.artist}
          </a>
        </div>

        {/* Context link (playlist/album/etc.) */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
          <a href={contextUrl} target="_blank" style={{ fontSize: 12, color: "#a7a7a7", textDecoration: "none" }}>
            {contextName || contextType}
          </a>
        </div>
      </div>

      {/* Bottom right action buttons */}
      <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 12 }}>
        <div style={{ color: "#a7a7a7", cursor: "pointer" }}>❤️</div>
        <div style={{ color: "#a7a7a7", cursor: "pointer" }}>💬</div>
        <div style={{ color: "#a7a7a7", cursor: "pointer" }}>➕</div>
      </div>
    </div>
  );
};

function App() {
  const { friendActivity, loading, error } = useFriendActivity();

  return (
    // Main container for extension popup
    <div style={{
      background: "#121212", // dark Spotify background
      color: "#fff",
      width: 350,
      fontFamily: "spotify-circular, Circular, Helvetica, Arial, sans-serif",
      borderRadius: "8px",
      overflow: "hidden"
    }}>
      {/* Header bar */}
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>Friend Activity</h2>
      </div>

      {/* Conditional render: loading, error, or friend list */}
      {loading ? (
        <p style={{ padding: 16, color: "#aaa" }}>Loading friend activity…</p>
      ) : error ? (
        <p style={{ padding: 16, color: "#ff4d4f" }}>{error}</p>
      ) : friendActivity.length === 0 ? (
        <p style={{ padding: 16, color: "#aaa" }}>
          No friend activity right now. Make sure Spotify is open and Friend Activity is enabled.
        </p>
      ) : (
        friendActivity.map((friend) => <FriendCard key={friend.id} friend={friend} />)
      )}
    </div>
  );
}

export default App;
