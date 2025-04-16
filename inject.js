(function () {
    // Create a <script> tag
    const script = document.createElement("script");
  
    // Set its source to the bundled interceptor file
    script.src = chrome.runtime.getURL("fetch-api.js");
  
    // Clean up the script tag after it loads
    script.onload = function () {
      this.remove();
    };
  
    // Append to the page — this runs in the page's JS context
    (document.head || document.documentElement).appendChild(script);
  })();
  