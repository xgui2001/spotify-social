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
      // Persist login data to avoid logging in every time
      localStorage.setItem("spotifySocialUser", JSON.stringify(userData));
      onLogin(userData);
    } catch (err) {
      console.error('Login failed:', err);
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
      justifyContent: "center",
      padding: "20px",
      height: "auto",
      minHeight: "350px",
      maxHeight: "400px",
      background: "#121212",
      color: "#fff",
      fontFamily: "Montserrat, sans-serif",
      borderRadius: "12px",
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
          <img 
            src="icon_nobg.png" 
            alt="Spotifriends Logo" 
            width="32" 
            height="32" 
            style={{ objectFit: "contain" }}
          />
          <span style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "white",
            letterSpacing: "-0.5px"
          }}>Spotifriends</span>
        </div>
        <p style={{
          fontSize: "14px",
          color: "#a7a7a7",
          margin: "0",
          textAlign: "center",
          fontWeight: "400",
          letterSpacing: "0.2px"
        }}>See what your friends are listening to!</p>
      </div>
      
      {error && (
        <div style={{
          backgroundColor: "rgba(255, 77, 79, 0.1)",
          color: "#ff4d4f",
          padding: "12px",
          borderRadius: "4px",
          marginBottom: "20px",
          width: "100%",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ }}> {/* Added extra spacing here */}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Login with Spotify
            </>
          )}
        </button>
      </div>
      
      <p style={{
        fontSize: "11px",
        color: "#a7a7a7",
        marginTop: "20px",
        textAlign: "center",
        lineHeight: "1.5"
      }}>
        Connect with your Spotify account to interact with your friends' favorite tracks.
      </p>
    </div>
  );
}

export default Login;