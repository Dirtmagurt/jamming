import React, { useState, useEffect } from "react";
import SearchResults from "./SearchResults";
import Playlist from "./Playlist";
import Spotify from "../services/spotify";
import SearchBar from './SearchBar';
import UserPlaylists from "./UserPlaylists";


const mockSearchResults = [
  { id: 1, name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", uri: "spotify:track:0VjIjW4GlUZAMYd2vXMi3b" },
  { id: 2, name: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", uri: "spotify:track:463CkQjx2Zk1yXoBuierM9" },
  { id: 3, name: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", uri: "spotify:track:6UelLqGlWMcVH1E5c4H7lY" },
];

const mockPlaylistTracks = [
  { id: 101, name: "Save Your Tears", artist: "The Weeknd", album: "After Hours", uri: "spotify:track:5QO79kh1waicV47BqGRL3g" },
  { id: 102, name: "Don’t Start Now", artist: "Dua Lipa", album: "Future Nostalgia", uri: "spotify:track:3PfIrDoz19wz7qK7tYeu62" },
];




export  default function App() {
    const [searchResults, setSearchResults] = useState([]); // stand in for real API results

    const [playlistName, setPlaylistName] = useState("My Playlist");
    const [playlistTracks, setPlaylistTracks] = useState(mockPlaylistTracks);
    const [activePlaylistId, setActivePlaylistId] = useState(null);
    const [originalSnapshot, setOriginalSnapshot] = useState(null);




    //Added the onSearch function
    const onSearch = async (term) => {
        if (!term) return;

        try {
        const token = await Spotify.getAccessToken();
        console.log("Spotify token acquired:", token);

        
        const results = await Spotify.search(term);
            setSearchResults(results);

        } catch (err) {
        console.error(err);
        alert(err.message);
        }
  };


    const addTrack = (track) => {
    setPlaylistTracks((prevTracks) => {
        const exists = prevTracks.some((t) => t.uri === track.uri);
        return exists ? prevTracks : [...prevTracks, track];
    });
    };

    const removeTrack = (track) => {
    setPlaylistTracks((prevTracks) =>
        prevTracks.filter((t) => t.uri !== track.uri)
    );
    };


    const normalizeName = (s) => (s || "").trim().toLowerCase();

    const findDuplicateByName = (name, excludeId = null) => {
    const target = normalizeName(name);
    if (!target) return null;

    return userPlaylists.find(
        (p) => normalizeName(p.name) === target && p.id !== excludeId
    );
    };



  
  




    /// Save Playlist 
    const savePlaylist = async () => {
        const trackUris = playlistTracks.map((t) => t.uri);

        try {
            // EXISTING PLAYLIST MODE: update only if changed
            if (activePlaylistId) {
            if (!isDirty) return;

            // Prevent renaming to a name used by another playlist
            const dup = findDuplicateByName(playlistName, activePlaylistId);
            if (dup) {
                alert(
                `A different playlist already uses the name "${dup.name}". Please choose a different name.`
                );
                return;
            }

            await Spotify.updatePlaylist(activePlaylistId, playlistName, trackUris);

            // Update snapshot so Save disables again
            setOriginalSnapshot({
                id: activePlaylistId,
                name: playlistName,
                uris: trackUris,
            });

            return;
            }

            // NEW PLAYLIST MODE: prevent creating a duplicate name
            const dup = findDuplicateByName(playlistName);
            if (dup) {
            alert(
                `A playlist named "${dup.name}" already exists. Please choose a different name.`
            );
            return;
            }

            // Otherwise, keep current behavior: create a new playlist
            await Spotify.savePlaylist(playlistName, trackUris);

            setPlaylistName("New Playlist");
            setPlaylistTracks([]);
        } catch (err) {
            console.error(err);
            alert(err.message || "Save failed.");
        }
    };


        const [userPlaylists, setUserPlaylists] = useState([]);
        const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
        const [playlistsError, setPlaylistsError] = useState("");



        const refreshUserPlaylists = async () => {
            try {
                setIsLoadingPlaylists(true);
                const playlists = await Spotify.getCurrentUserPlaylists();
                setUserPlaylists(playlists);
                setPlaylistsError(null);
            } catch (e) {
                console.error(e);
                setPlaylistsError(e.message || "Failed to load playlists");
            } finally {
                setIsLoadingPlaylists(false);
            }
            };




        useEffect(() => {
        refreshUserPlaylists();
        }, []);






    const playlistUris = new Set(playlistTracks.map((t) => t.uri));



    const computeIsDirty = () => {
    // If nothing loaded, keep current behavior 
        if (!originalSnapshot || !activePlaylistId) return false;

        const currentName = playlistName.trim();
        const originalName = (originalSnapshot.name || "").trim();

        const currentUris = playlistTracks.map((t) => t.uri);
        const originalUris = originalSnapshot.uris || [];

        const nameChanged = currentName !== originalName;

        const tracksChanged =
            currentUris.length !== originalUris.length ||
            currentUris.some((uri, i) => uri !== originalUris[i]);

        return nameChanged || tracksChanged;
        };

    const isDirty = computeIsDirty();

    ///This is the function for loading a current playlist into our Playlist "editor panel"
    const loadPlaylistIntoEditor = async (playlistId) => {
        try {
            const playlistMeta = userPlaylists.find((p) => p.id === playlistId);

            // Load tracks from Spotify
            const tracks = await Spotify.getPlaylistTracks(playlistId);

            // Set editor state
            setActivePlaylistId(playlistId);
            setPlaylistName(playlistMeta?.name || "Selected Playlist");
            setPlaylistTracks(tracks);

            // Snapshot for change detection
            setOriginalSnapshot({
            id: playlistId,
            name: playlistMeta?.name || "Selected Playlist",
            uris: tracks.map((t) => t.uri),
            });
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to load playlist.");
        }
        };

    const canSave = activePlaylistId ? isDirty : playlistTracks.length > 0;



    const startNewPlaylist = () => {
        if (activePlaylistId && isDirty) {
            const ok = window.confirm("Discard unsaved changes and start a new playlist?");
            if (!ok) return;
        }

        setActivePlaylistId(null);
        setOriginalSnapshot(null);
        setPlaylistName("My Playlist");
        setPlaylistTracks([]);
        };






        return (
        <div className="App">
            <header className="App-header">
            <div className="App-header-inner">
                <div className="Brand">
                <h1 className="Brand-title">Jammming</h1>
                <p className="Brand-subtitle">
                    Search Spotify, build a playlist, save it instantly.
                </p>
                </div>

                <div className="Badge">
                <span className="Badge-dot" />
                Connected via Spotify OAuth
                </div>
            </div>
            </header>

            <main className="App-main">
            {/* TOP ROW: Search + Playlist (40/40) */}
            <div className="TopRow">
                <section className="Panel">
                <div className="Panel-header">
                    <div className="Panel-title">
                    Search
                    <span className="Panel-meta">Find tracks to add</span>
                    </div>
                </div>

                <div className="Panel-body">
                    <SearchBar onSearch={onSearch} />
                    <div className="Divider" />
                    <SearchResults
                    tracks={searchResults}
                    onAddTrack={addTrack}
                    playlistUris={playlistUris}
                    />
                </div>
                </section>

                <section className="Panel">
                <div className="Panel-header">
                    <div className="Panel-title">
                    Playlist
                    <span className="Panel-meta">{playlistTracks.length} track(s)</span>
                    </div>
                </div>

                <div className="Panel-body">
                    <Playlist
                    name={playlistName}
                    tracks={playlistTracks}
                    onNameChange={setPlaylistName}
                    onRemoveTrack={removeTrack}
                    onSave={savePlaylist}
                    canSave={canSave}
                    isEditingExisting={Boolean(activePlaylistId)}
                    onStartNew={startNewPlaylist}
                    />
                </div>
                </section>
            </div>

            {/* BOTTOM ROW: Your Playlists (20%) */}
            <section className="Panel BottomRow">
                <div className="Panel-header">
                <div className="Panel-title">
                    Your Playlists
                    <span className="Panel-meta">{userPlaylists.length} total</span>
                </div>
                </div>

                <div className="Panel-body">
                <UserPlaylists
                    playlists={userPlaylists}
                    isLoading={isLoadingPlaylists}
                    error={playlistsError}
                    onSelectPlaylist={loadPlaylistIntoEditor}
                />
                </div>
            </section>
            </main>
        </div>
        );

}