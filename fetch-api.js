// Save the original fetch function so we can call it later
const originalFetch = window.fetch;

// Override window.fetch
window.fetch = async (...args) => {
  // Call the original fetch with its arguments
  const response = await originalFetch(...args);

  try {
    const url = args[0];
    const headers = args[1]?.headers || {};

    // Try to grab the token from the request headers
    const token = headers.Authorization || headers.authorization;

    // If it's a Bearer token, send it back to the extension
    if (token && token.includes("Bearer")) {
      window.postMessage({ type: "ACCESS", token }, "*");
    }
  } catch (err) {
    // Silently ignore errors (fetch could be weirdly shaped)
  }

  // Always return the original response
  return response;
};
