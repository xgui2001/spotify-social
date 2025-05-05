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