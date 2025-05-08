import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("signin"); // "signin" or "signup"
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication (replace with actual auth logic)
    setTimeout(() => {
      // For demo purposes, any login succeeds
      setIsLoading(false);
      
      // Store auth state if "stay signed in" is checked
      if (staySignedIn) {
        localStorage.setItem("spotifySocialUser", JSON.stringify({ username }));
      }
      
      // Call parent component's login handler
      onLogin({ username });
    }, 800);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "30px 20px",
      background: "#121212",
      minHeight: "100vh",
      color: "white",
      fontFamily: "Montserrat, sans-serif",
      maxWidth: "350px",
      margin: "0 auto",
      borderRadius: "12px", // Add rounded corners
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)" // Add subtle shadow
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px"
        }}>
          {/* User Icon */}
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#1DB954"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "white"
          }}>Spotifriends</span>
        </div>
        <p style={{
          fontSize: "14px",
          color: "#a7a7a7",
          margin: "0",
          textAlign: "center"
        }}>see what your friends are listening!</p>
      </div>
      
      <div style={{
        display: "flex",
        width: "100%",
        marginBottom: "24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <button 
          style={{
            flex: "1",
            background: "transparent",
            border: "none",
            color: activeTab === "signin" ? "white" : "#a7a7a7",
            padding: "12px 0",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            position: "relative",
            letterSpacing: "1px",
            borderBottom: activeTab === "signin" ? "2px solid #1DB954" : "none"
          }}
          onClick={() => setActiveTab("signin")}
        >
          SIGN IN
        </button>
        <button 
          style={{
            flex: "1",
            background: "transparent",
            border: "none",
            color: activeTab === "signup" ? "white" : "#a7a7a7",
            padding: "12px 0",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            position: "relative",
            letterSpacing: "1px",
            borderBottom: activeTab === "signup" ? "2px solid #1DB954" : "none"
          }}
          onClick={() => setActiveTab("signup")}
        >
          SIGN UP
        </button>
      </div>
      
      <form 
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "30px",
            border: "none",
            backgroundColor: "white",
            fontSize: "14px",
            color: "#333",
            boxSizing: "border-box"
          }}
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "30px",
            border: "none",
            backgroundColor: "white",
            fontSize: "14px",
            color: "#333",
            boxSizing: "border-box"
          }}
        />
        
        <div style={{
          display: "flex",
          alignItems: "center",
          margin: "4px 0 16px 4px"
        }}>
          <div style={{
            position: "relative",
            width: "16px",
            height: "16px",
            marginRight: "8px"
          }}>
            <input
              type="checkbox"
              id="stay-signed-in"
              checked={staySignedIn}
              onChange={() => setStaySignedIn(!staySignedIn)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                width: "16px",
                height: "16px",
                border: `1px solid ${staySignedIn ? "#1DB954" : "#a7a7a7"}`,
                borderRadius: "2px",
                backgroundColor: staySignedIn ? "#1DB954" : "transparent",
                cursor: "pointer",
                position: "absolute",
                top: 0,
                left: 0
              }}
            />
            {staySignedIn && (
              <span style={{
                position: "absolute",
                top: "0px",
                left: "3px",
                color: "white",
                fontSize: "12px"
              }}>✓</span>
            )}
          </div>
          <label 
            htmlFor="stay-signed-in"
            style={{
              fontSize: "14px",
              color: "#a7a7a7",
              cursor: "pointer"
            }}
          >
            stay signed in
          </label>
        </div>
        
        <button 
          type="submit" 
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#1DB954",
            color: "white",
            border: "none",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            marginTop: "8px",
            letterSpacing: "1px",
            opacity: isLoading ? 0.7 : 1
          }}
          disabled={isLoading}
        >
          {activeTab === "signin" ? "SIGN IN" : "SIGN UP"}
        </button>
      </form>
      
      <div style={{
        marginTop: "24px"
      }}>
        <a 
          href="#"
          style={{
            color: "#a7a7a7",
            fontSize: "14px",
            textDecoration: "none"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "white"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#a7a7a7"}
        >
          Forgot Password?
        </a>
      </div>
    </div>
  );
}

export default Login;