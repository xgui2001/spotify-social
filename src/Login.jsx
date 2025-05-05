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
    <div className="spotifriends-login-container">
      <div className="login-logo-container">
        <div className="login-logo">
          {/* User Icon */}
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#1DB954"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span>Spotifriends</span>
        </div>
        <p className="login-subtitle">see what your friends are listening!</p>
      </div>
      
      <div className="login-tabs">
        <button 
          className={activeTab === "signin" ? "active" : ""} 
          onClick={() => setActiveTab("signin")}
        >
          SIGN IN
        </button>
        <button 
          className={activeTab === "signup" ? "active" : ""} 
          onClick={() => setActiveTab("signup")}
        >
          SIGN UP
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        
        <div className="stay-signed-in">
          <input
            type="checkbox"
            id="stay-signed-in"
            checked={staySignedIn}
            onChange={() => setStaySignedIn(!staySignedIn)}
          />
          <label htmlFor="stay-signed-in">stay signed in</label>
        </div>
        
        <button 
          type="submit" 
          className="sign-in-button"
          disabled={isLoading}
        >
          {activeTab === "signin" ? "SIGN IN" : "SIGN UP"}
        </button>
      </form>
      
      <div className="forgot-password">
        <a href="#">Forgot Password?</a>
      </div>
    </div>
  );
}

export default Login;