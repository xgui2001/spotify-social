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
    
    // Always send a response to avoid "Receiving end does not exist" errors
    sendResponse({received: true});
    return true;  // Keep the channel open for async responses
  }
);