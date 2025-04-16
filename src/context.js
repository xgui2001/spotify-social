import { getSpotifyToken } from "./auth";

export async function enrichContext(contextUri) {
  if (!contextUri?.startsWith("spotify:")) return null;

  const [_, type, id] = contextUri.split(":");

  // Spotify API expects "albums", "playlists", "artists"
  if (!["album", "playlist", "artist"].includes(type)) return null;

  try {
    const token = await getSpotifyToken();
    if (!token) return null;

    const res = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    return {
      name: data.name,
      image: data.images?.[0]?.url,
      url: data.external_urls?.spotify
    };
  } catch (err) {
    console.warn("Failed to enrich context", contextUri, err);
    return null;
  }
}
