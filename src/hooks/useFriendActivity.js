import { useEffect, useState } from "react";
import { getSpotifyToken } from "../auth";
import { enrichContext } from "../context";

/**
 * useFriendActivity - A custom hook to fetch and format Spotify Friend Activity
 *
 * Handles:
 * - Spotify token retrieval through auth.js
 * - Data fetching from Spotify internal API
 * - Context enrichment (e.g., getting playlist/album names)
 * - Online status + track/context URL formatting
 */
export function useFriendActivity() {
  const [friendActivity, setFriendActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchFriendActivity() {
      try {
        // Get a valid token from our auth utility
        const token = await getSpotifyToken();
        
        if (!token) {
          throw new Error("No authentication token available");
        }
        
        // Fetch friend activity data
        const response = await fetch(
          "https://guc-spclient.spotify.com/presence-view/v1/buddylist",
          {
            headers: { Authorization: token },
          }
        );

        if (!response.ok) {
          throw new Error(`Spotify API returned ${response.status}`);
        }

        const rawBody = await response.text();
        if (!rawBody) {
          throw new Error("Spotify returned an empty body");
        }

        const data = JSON.parse(rawBody);

        // Process and enrich the data
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

        // Only update state if the component is still mounted
        if (isMounted) {
          setFriendActivity(enriched);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching Spotify data:", err);
        
        if (isMounted) {
          setError(err.message || "Something went wrong fetching data");
          setLoading(false);
        }
      }
    }

    fetchFriendActivity();

    // Set up polling to refresh data every minute
    const intervalId = setInterval(() => {
      fetchFriendActivity();
    }, 60000);

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { friendActivity, loading, error };
}