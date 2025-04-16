// content.js

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "ACCESS" && event.data.token) {
    // ✅ Just store to localStorage (content scripts always have access to it)
    localStorage.setItem("accessTokenBackup", event.data.token);
    console.log("🟢 Token saved to localStorage.");
  }
});
