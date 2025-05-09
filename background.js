chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("open.spotify.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log("✅ Executing inside Spotify tab");
        
        // First, try to get token from localStorage
        const token = localStorage.getItem("accessTokenBackup");
        
        if (!token) {
          console.error("❌ No Spotify token found in localStorage");
          chrome.runtime.sendMessage({ error: "No Spotify token found" });
          return;
        }
        
        // Now fetch with the token in the Authorization header
        fetch("https://guc-spclient.spotify.com/presence-view/v1/buddylist", {
          headers: {
            "Authorization": token
          }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`API returned ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            console.log("🎉 Got data:", data);
            chrome.runtime.sendMessage({ friendData: data });
          })
          .catch(err => {
            console.error("❌ Fetch error:", err);
            chrome.runtime.sendMessage({ error: err.message });
          });
      }
    });
  } else {
    console.log("⚠️ Not a Spotify tab:", tab.url);
  }
});


// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Background script received message:", request);
    
    if (request.type === 'auth_started') {
      console.log('Auth process started');
    }
    
    if (request.type === 'auth_completed') {
      console.log('Auth process completed');
      // Notify any open extension pages
      chrome.runtime.sendMessage({
        type: 'auth_status',
        status: 'success',
        user: request.user
      });
    }
    
    if (request.type === 'auth_failed') {
      console.log('Auth process failed:', request.error);
      // Notify any open extension pages
      chrome.runtime.sendMessage({
        type: 'auth_status',
        status: 'error',
        error: request.error
      });
    }
    
    if (request.type === "GET_FRIEND_ACTIVITY") {
      // Find the Spotify tab
      chrome.tabs.query({ url: "*://open.spotify.com/*" }, (tabs) => {
        if (tabs.length === 0) {
          sendResponse({ error: "No Spotify tab found. Please open Spotify Web Player." });
          return;
        }
        
        // Execute script in the Spotify tab to get friend activity
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: getFriendActivity
        }, (results) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: "Script execution error: " + chrome.runtime.lastError.message });
            return;
          }
          
          if (!results || !results[0]) {
            sendResponse({ error: "No results from script execution" });
            return;
          }
          
          sendResponse({ data: results[0].result });
        });
        
        // Return true to indicate we'll respond asynchronously
        return true;
      });
      
      // Return true to indicate we'll respond asynchronously
      return true;
    }
    
    // Always send a response to avoid "Receiving end does not exist" errors
    sendResponse({received: true});
    return true;  // Keep the channel open for async responses
  }
);

// Function to be injected into the Spotify tab
function getFriendActivity() {
  return new Promise((resolve, reject) => {
    // Use the injected token to make the request
    const accessToken = localStorage.getItem("accessToken") || 
                        localStorage.getItem("accessTokenBackup");
    
    if (!accessToken) {
      return resolve({ error: "No Spotify access token found" });
    }
    
    fetch("https://guc-spclient.spotify.com/presence-view/v1/buddylist", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Process the friend activity data
      const friends = data.friends || [];
      const processedData = friends.map(friend => ({
        user: {
          name: friend.user.name,
          uri: friend.user.uri,
          imageUrl: friend.user.imageUrl
        },
        track: {
          name: friend.track.name,
          uri: friend.track.uri,
          imageUrl: friend.track.imageUrl,
          context: friend.track.context ? friend.track.context.name : "",
          artist: {
            name: friend.track.artist.name,
            uri: friend.track.artist.uri
          }
        },
        timestamp: friend.timestamp
      }));
      
      resolve(processedData);
    })
    .catch(error => {
      console.error("Error fetching friend activity:", error);
      resolve({ error: error.message });
    });
  });
}

// Add this to your existing background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_AUTH_WINDOW') {
    // Your OAuth URL
const authUrl = 'https://spotify-backend-eta.vercel.app/api/auth/login';
    
    chrome.windows.create({
      url: authUrl,
      type: 'popup',
      width: 500,
      height: 600
    }, (window) => {
      // Store the window ID to track it
      chrome.storage.local.set({ authWindowId: window.id });
      sendResponse({ success: true });
    });
    
    return true; // Keep the message channel open for async response
  }
});

// Add a listener for window closing
chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get(['authWindowId'], (result) => {
    if (result.authWindowId === windowId) {
      // Auth window was closed without completing auth
      chrome.storage.local.remove(['authWindowId']);
      chrome.runtime.sendMessage({
        type: 'auth_status',
        status: 'error',
        error: 'Authentication window was closed'
      });
    }
  });
});