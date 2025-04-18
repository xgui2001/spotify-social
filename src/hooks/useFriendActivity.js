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
            setError("Please open Spotify to load friend activity");
            setLoading(false);
            return;
          }

          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              func: () => localStorage.getItem("accessTokenBackup"),
            },
            ([result]) => {
              const fallbackToken = result?.result;
              if (fallbackToken) {
                chrome.storage.sync.set({ accessToken: fallbackToken });
                fetchAndSet(fallbackToken);
              } else {
                setError("Could not retrieve Spotify token");
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
        const response = await fetch(
          "https://guc-spclient.spotify.com/presence-view/v1/buddylist",
          {
            headers: { Authorization: token },
          }
        );

        if (!response.ok) {
          setError(`Spotify API returned ${response.status}`);
          setLoading(false);
          return;
        }

        const rawBody = await response.text();
        if (!rawBody) {
          setError("Spotify returned an empty body");
          setLoading(false);
          return;
        }

        const data = JSON.parse(rawBody);

        const enriched = await Promise.all(
          (data.friends || []).map(async (f) => {
            const secondsAgo = Math.round((Date.now() - f.timestamp) / 1000);
            const online = secondsAgo <= 300;

            const contextUriParts = (f.track?.context?.uri ?? "").split(":");
            const contextType = contextUriParts[1];
            const contextID = contextUriParts[2];
            const contextUrl =
              contextType && contextID
                ? `https://open.spotify.com/${contextType}/${contextID}`
                : null;

            const trackID = f.track?.uri?.split(":").pop();
            const trackUrl =
              contextType === "album"
                ? `${contextUrl}?highlight=spotify:track:${trackID}`
                : `https://open.spotify.com/track/${trackID}`;

            const artistUrl = f.track?.artist_uri
              ? `https://open.spotify.com/artist/${f.track.artist_uri.split(":").pop()}`
              : null;

            const contextData = await enrichContext(f.track?.context?.uri);

            return {
              id: f.user_id,
              name: f.user_name || f.user?.name || "Unknown Friend",
              track: f.track?.name ?? "Unknown Track",
              artist: Array.isArray(f.track?.artists)
                ? f.track.artists
                    .map((a) => (typeof a === "string" ? a : a?.name))
                    .join(", ")
                : f.track?.artist?.name || "Unknown Artist",
              secondsAgo,
              online,
              contextType,
              contextName: contextData?.name,
              contextUrl: contextData?.url ?? contextUrl,
              trackUrl,
              artistUrl,
              profileImage: f.user?.imageUrl || null,
            };
          })
        );

        setFriendActivity(enriched);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching Spotify data:", err);
        setError("Something went wrong fetching data");
        setLoading(false);
      }
    }
  }, []);

  return { friendActivity, loading, error };
}
