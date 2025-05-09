import { useEffect, useState } from "react";
import { enrichContext } from "../context";

/**
 * useFriendActivity - A custom hook to fetch and format Spotify Friend Activity
 *
 * Handles:
 * - Spotify token retrieval from chrome.storage.sync or localStorage (via scripting)
 * - Data fetching from Spotify internal API
 * - Context enrichment (e.g., getting playlist/album names)
 * - Online status + track/context URL formatting
 */
export function useFriendActivity() {
  const [friendActivity, setFriendActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Step 1: Try to get the token from chrome.storage first
    chrome.storage.sync.get("accessToken", async ({ accessToken }) => {
      let token = accessToken;

      if (!token) {
        // Step 2: If not found in chrome.storage, check localStorage via scripting
        chrome.tabs.query({ url: "*://open.spotify.com/*" }, (tabs) => {
          if (!tabs.length) {
            setError("Please open Spotify Web Player (open.spotify.com) to load friend activity");
            setLoading(false);
            return;
          }

          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              func: () => {
                // Try multiple possible token locations
                return localStorage.getItem("accessTokenBackup") || 
                       localStorage.getItem("accessToken") || 
                       localStorage.getItem("spotifyToken");
              },
            },
            (results) => {
              if (chrome.runtime.lastError) {
                console.error("Script execution error:", chrome.runtime.lastError);
                setError("Error accessing Spotify tab: " + chrome.runtime.lastError.message);
                setLoading(false);
                return;
              }

              const result = results && results[0];
              const fallbackToken = result?.result;
              
              if (fallbackToken) {
                console.log("Token found in Spotify tab");
                chrome.storage.sync.set({ accessToken: fallbackToken });
                fetchAndSet(fallbackToken);
              } else {
                console.log("No token found in Spotify tab");
                setError("Could not retrieve Spotify token. Please make sure you're logged in to Spotify Web Player.");
                setLoading(false);
              }
            }
          );
        });
      } else {
        fetchAndSet(token);
      }
    });

    // Helper: fetch and format data
    async function fetchAndSet(token) {
      try {
        console.log("Fetching friend activity with token");
        
        // Make sure token is properly formatted with Bearer prefix if needed
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        
        const response = await fetch(
          "https://guc-spclient.spotify.com/presence-view/v1/buddylist",
          {
            headers: { 
              "Authorization": authHeader,
              "App-Platform": "WebPlayer",
              "Spotify-App-Version": "1.2.0"
            },
          }
        );

        if (!response.ok) {
          console.error(`API error: ${response.status}`);
          // If token is invalid, clear it from storage
          if (response.status === 401) {
            console.log("Token is invalid, clearing from storage");
            chrome.storage.sync.remove("accessToken");
          }
          setError(`Spotify API returned ${response.status}. Please refresh or try again later.`);
          setLoading(false);
          return;
        }

        const rawBody = await response.text();
        if (!rawBody) {
          console.error("Empty response body");
          setError("Spotify returned an empty response");
          setLoading(false);
          return;
        }

        let data;
        try {
          data = JSON.parse(rawBody);
        } catch (e) {
          console.error("JSON parse error:", e);
          setError("Error parsing Spotify response");
          setLoading(false);
          return;
        }

        if (!data.friends || !Array.isArray(data.friends)) {
          console.log("No friends data found or invalid format");
          setFriendActivity([]);
          setLoading(false);
          return;
        }

        console.log(`Processing ${data.friends.length} friends`);
        
        // Process the data with better error handling
        const enriched = await Promise.all(
          data.friends.map(async (f) => {
            try {
              // Safely access properties with fallbacks
              const secondsAgo = Math.round((Date.now() - (f.timestamp || Date.now())) / 1000);
              const online = secondsAgo <= 300;

              const contextUriParts = (f.track?.context?.uri ?? "").split(":");
              const contextType = contextUriParts[1] || "";
              const contextID = contextUriParts[2] || "";
              const contextUrl =
                contextType && contextID
                  ? `https://open.spotify.com/${contextType}/${contextID}`
                  : null;

              const trackID = (f.track?.uri || "").split(":").pop();
              const trackUrl = trackID
                ? (contextType === "album"
                  ? `${contextUrl}?highlight=spotify:track:${trackID}`
                  : `https://open.spotify.com/track/${trackID}`)
                : null;

              const artistUrl = f.track?.artist_uri
                ? `https://open.spotify.com/artist/${f.track.artist_uri.split(":").pop()}`
                : null;

              let contextData = null;
              try {
                contextData = f.track?.context?.uri ? await enrichContext(f.track.context.uri) : null;
              } catch (e) {
                console.warn("Error enriching context:", e);
                // Continue without enriched context
              }

              return {
                id: f.user_id || "unknown",
                name: f.user_name || f.user?.name || "Unknown Friend",
                track: f.track?.name ?? "Unknown Track",
                artist: Array.isArray(f.track?.artists)
                  ? f.track.artists
                      .map((a) => (typeof a === "string" ? a : (a?.name || "Unknown")))
                      .join(", ")
                  : f.track?.artist?.name || "Unknown Artist",
                secondsAgo,
                online,
                contextType,
                contextName: contextData?.name || f.track?.context?.name || "",
                contextUrl: contextData?.url || contextUrl || "",
                trackUrl: trackUrl || "",
                artistUrl: artistUrl || "",
                profileImage: f.user?.imageUrl || null,
              };
            } catch (err) {
              console.error("Error processing friend data:", err);
              // Return a minimal valid object instead of crashing
              return {
                id: "error",
                name: "Error processing data",
                track: "Unknown",
                artist: "Unknown",
                secondsAgo: 0,
                online: false,
                contextType: "",
                contextName: "",
                contextUrl: "",
                trackUrl: "",
                artistUrl: "",
                profileImage: null,
              };
            }
          })
        );

        console.log("Friend activity data processed successfully");
        setFriendActivity(enriched.filter(f => f.id !== "error"));
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching Spotify data:", err);
        setError(err.message || "Something went wrong fetching data");
        setLoading(false);
      }
    }
  }, []);

  return { friendActivity, loading, error };
}