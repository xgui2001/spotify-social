import React, { useState } from "react";
import "./Login.css";
import { initiateSpotifyAuth } from "./auth";

function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await initiateSpotifyAuth();
      onLogin(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to authenticate with Spotify');
    } finally {
      setIsLoading(false);
    }
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
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)"
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
          {/* Spotify Icon */}
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path
              fill="#1DB954"
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
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
        }}>see what your friends are listening to!</p>
      </div>
      
      {error && (
        <div style={{
          backgroundColor: "rgba(255, 77, 79, 0.1)",
          border: "1px solid rgba(255, 77, 79, 0.3)",
          borderRadius: "4px",
          padding: "12px",
          marginBottom: "20px",
          color: "#ff4d4f",
          width: "100%",
          textAlign: "center",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={handleSpotifyLogin}
        disabled={isLoading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "14px",
          backgroundColor: "#1DB954",
          color: "white",
          border: "none",
          borderRadius: "30px",
          fontSize: "14px",
          fontWeight: "700",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "background-color 0.2s ease",
          marginTop: "20px",
          opacity: isLoading ? 0.7 : 1,
          gap: "8px"
        }}
      >
        {isLoading ? (
          <span style={{ display: "inline-block", animation: "pulse 1.5s infinite ease-in-out" }}>
            Connecting...
          </span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="white"
                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
              />
            </svg>
            LOGIN WITH SPOTIFY
          </>
        )}
      </button>
      
      <p style={{
        fontSize: "13px",
        color: "#a7a7a7",
        marginTop: "20px",
        textAlign: "center",
        lineHeight: "1.5"
      }}>
        Connect with your Spotify account to see and interact with what your friends are listening to.
      </p>
    </div>
  );
}

export default Login;