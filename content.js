// content.js

// If accessToken is already stored, no need to inject again
const existingToken = localStorage.getItem("accessTokenBackup");
if (!existingToken) {
  console.log("🔄 No stored token — injecting fetch interceptor...");

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("fetch-api.js"); // or whatever you renamed Jack's interceptor to
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
} else {
  console.log("✅ Using cached access token from localStorage.");
}

// Listener for token messages from fetch-api.js
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "ACCESS" && event.data.token) {
    try {
      chrome.storage?.sync?.set({ accessToken: event.data.token });
    } catch (e) {
      console.warn("❌ chrome.storage.sync failed, falling back to localStorage", e);
    }

    localStorage.setItem("accessTokenBackup", event.data.token);
    console.log("✅ Stored fresh token from Spotify.");
  }
});
