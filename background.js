chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("open.spotify.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log("✅ Executing inside Spotify tab");
        fetch("https://guc-spclient.spotify.com/presence-view/v1/buddylist")
          .then(res => res.json())
          .then(data => {
            console.log("🎉 Got data:", data);
            chrome.runtime.sendMessage({ friendData: data });
          })
          .catch(err => {
            console.error("❌ Fetch error:", err);
          });
      }
    });
  } else {
    console.log("⚠️ Not a Spotify tab:", tab.url);
  }
});
