

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
    const text = await resp.text();
    if (resp.status === 401) {
      throw new Error("Invalid or expired access token, please log in again.");
    }
    throw new Error(`Spotify API error (${resp.status}): ${text}`);
  }

  return resp.status === 204 ? null : resp.json();
}



const Spotify = {
  async getAccessToken() {
    // 1) If we already have a valid token stored, use it
    const stored = getStoredToken();
    if (stored) return stored;

    // 2) If we were redirected back from Spotify, we should have ?code=...
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      // User denied access or Spotify returned an OAuth error
      clearUrlParams();
      throw new Error(`Spotify authorization error: ${error}`);
    }

    if (code) {
      // Exchange code for token, store it, return it
      return await exchangeCodeForToken(code);
    }

    // 3) Otherwise, no token + no code: start login
    await redirectToSpotifyLogin();

    // redirectToSpotifyLogin navigates away; this is here for completeness
    return null;
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


};

export default Spotify;
