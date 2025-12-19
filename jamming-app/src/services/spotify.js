

// src/services/spotify.js

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

// Scopes needed to create playlists + add tracks.
// Add playlist-modify-private too if you want private playlists.
const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");



// Spotify endpoints
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
let tokenRequestInFlight = null;


// Storage keys
const LS_TOKEN = "spotify_access_token";
const LS_EXPIRES_AT = "spotify_expires_at";
const LS_VERIFIER = "spotify_pkce_verifier";

// ---- PKCE helpers ----
function generateRandomString(length = 64) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";
  const values = crypto.getRandomValues(new Uint8Array(length));
  values.forEach((v) => (text += possible[v % possible.length]));
  return text;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

function setToken(accessToken, expiresInSeconds) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(LS_TOKEN, accessToken);
  localStorage.setItem(LS_EXPIRES_AT, String(expiresAt));
}

function getStoredToken() {
  const token = localStorage.getItem(LS_TOKEN);
  const expiresAtRaw = localStorage.getItem(LS_EXPIRES_AT);
  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : 0;

  if (!token || !expiresAt) return null;
  if (Date.now() >= expiresAt) {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_EXPIRES_AT);
    return null;
  }
  return token;
}

function clearUrlParams() {
  // Remove ?code=...&state=... etc. after processing
  window.history.replaceState({}, document.title, window.location.pathname);
}


async function redirectToSpotifyLogin() {
  if (!clientId || !redirectUri) {
    throw new Error("Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_REDIRECT_URI.");
  }

  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem(LS_VERIFIER, verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.assign(`${AUTH_ENDPOINT}?${params.toString()}`);
}



async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem(LS_VERIFIER);
  if (!verifier) throw new Error("Missing PKCE code verifier. Please log in again.");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const resp = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  // data.access_token, data.expires_in, (and usually refresh_token in code flow)
  setToken(data.access_token, data.expires_in);

  localStorage.removeItem(LS_VERIFIER);
  clearUrlParams();

  return data.access_token;
}

async function fetchJson(url, accessToken) {
    const resp = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
    });
    
    if (!resp.ok) {
        const text = await resp.text();

        //Incase token error
        if(resp.status === 401) {
            throw new Error ("Invalid or expired access token, please log in again.")
        }

        throw new Error (`Spotify API error (${resp.status}): ${text}`);
     }

     return resp.json();
}

  async function spotifyFetch(url, accessToken, options = {}) {
    const resp = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (resp.status === 401) {
        throw new Error("Invalid or expired access token, please log in again.");
      }
      throw new Error(`Spotify API error (${resp.status}): ${text}`);
    }

    // if Spotify returns 204 No Content for PUTs/DELETEs
    if (resp.status === 204) return null;

    // Some Spotify endpoints return 200/201 with an empty body.
    // Avoids calling resp.json() unless we actually have JSON to parse.
    const contentType = resp.headers.get("content-type") || "";

    // Read body once (can't call json() after text())
    const text = await resp.text().catch(() => "");

    // Empty body? Return null (prevents "Unexpected end of JSON input")
    if (!text) return null;

    // JSON body? Parse it
    if (contentType.includes("application/json")) {
      return JSON.parse(text);
    }

    // Non-JSON body? Return raw text (rare, but safe)
    return text;
  }




const Spotify = {
  async getAccessToken() {
    const stored = getStoredToken();
    if (stored) return stored;

    // If another call is already exchanging or redirecting, wait for it.
    if (tokenRequestInFlight) return tokenRequestInFlight;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      clearUrlParams();
      throw new Error(`Spotify authorization error: ${error}`);
    }

    if (code) {
      // IMPORTANT: set in-flight promise before awaiting so other callers reuse it
      tokenRequestInFlight = (async () => {
        try {
          const token = await exchangeCodeForToken(code);
          return token;
        } finally {
          tokenRequestInFlight = null;
        }
      })();

      return tokenRequestInFlight;
    }

    tokenRequestInFlight = (async () => {
      try {
        await redirectToSpotifyLogin();
        return null;
      } finally {
        tokenRequestInFlight = null;
      }
    })();

    return tokenRequestInFlight;
  },


    async search(term) {
    const accessToken = await this.getAccessToken(); // will redirect if not logged in
    if (!accessToken) return [];

    const encodedTerm = encodeURIComponent(term);
    const url = `https://api.spotify.com/v1/search?q=${encodedTerm}&type=track`;

    const json = await fetchJson(url, accessToken);

    // json.tracks.items is the list of tracks returned by Search 
    const items = json.tracks?.items ?? [];

    // Convert Spotify’s track format into your app format
    return items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.[0]?.name ?? "Unknown Artist",
      album: t.album?.name ?? "Unknown Album",
      uri: t.uri,
    }));
  },

    async savePlaylist(playlistName, trackUris) {
    // Guard clauses (helps prevent weird API calls)
    if (!playlistName) return;
    if (!trackUris || trackUris.length === 0) return;

    const accessToken = await this.getAccessToken();
    if (!accessToken) return;

    // 1) Get current user id: GET /v1/me :contentReference[oaicite:9]{index=9}
    const me = await spotifyFetch("https://api.spotify.com/v1/me", accessToken);
    const userId = me.id;

    // 2) Create playlist: POST /v1/users/{user_id}/playlists :contentReference[oaicite:10]{index=10}
    const created = await spotifyFetch(
      `https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          name: playlistName,
          description: "Created with Jammming",
          public: false, // optional: set true if you want public playlists
        }),
      }
    );

    const playlistId = created.id;

    // 3) Add items to playlist: POST /v1/playlists/{playlist_id}/tracks :contentReference[oaicite:11]{index=11}
    await spotifyFetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/tracks`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          uris: trackUris, // IMPORTANT: Spotify expects URIs here :contentReference[oaicite:12]{index=12}
        }),
      }
    );
  },

  async getCurrentUserPlaylists(limit = 50) {
    const accessToken = await this.getAccessToken();

    let url = `https://api.spotify.com/v1/me/playlists?limit=${limit}`;
    const all = [];

    while (url) {
      const data = await spotifyFetch(url, accessToken);
      all.push(...(data.items || []));
      url = data.next;
    }

    return all.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.images?.[0]?.url || "",
      trackCount: p.tracks?.total ?? 0,
      owner: p.owner?.display_name || p.owner?.id || "",
    }));
  },

    

  async getPlaylistTracks(playlistId, limit = 100) {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    let url = `https://api.spotify.com/v1/playlists/${encodeURIComponent(
      playlistId
    )}/tracks?limit=${limit}`;

    const allItems = [];

    while (url) {
      const data = await spotifyFetch(url, accessToken);
      allItems.push(...(data.items || []));
      url = data.next;
    }

    return allItems
      .map((item) => item.track)
      .filter(Boolean)
      .map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artists?.[0]?.name ?? "Unknown Artist",
        album: t.album?.name ?? "Unknown Album",
        uri: t.uri,
      }));
  },

  async updatePlaylist(playlistId, playlistName, trackUris) {
    if (!playlistId) return;
    if (!playlistName) return;
    if (!trackUris || trackUris.length === 0) return;

    const accessToken = await this.getAccessToken();
    if (!accessToken) return;

    // 1) Update playlist details (name)
    await spotifyFetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({
          name: playlistName,
          public: false, 
          description: "Updated with Jammming",
        }),
      }
    );

    // 2) Replace playlist items to match the UI 
    await spotifyFetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/tracks`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({
          uris: trackUris,
        }),
      }
    );
  },



};

export default Spotify;
