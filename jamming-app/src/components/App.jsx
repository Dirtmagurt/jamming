import React, { useState } from "react";
import SearchResults from "./SearchResults";
import Playlist from "./Playlist";
import Spotify from "../services/spotify";
import SearchBar from './SearchBar';


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


  
  




        // Save Playlist 
    const savePlaylist = async () => {
    const trackUris = playlistTracks.map((t) => t.uri);

    try {
        await Spotify.savePlaylist(playlistName, trackUris);

        // Reset UI after successful save
        setPlaylistName("New Playlist");
        setPlaylistTracks([]);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
    };

    const playlistUris = new Set(playlistTracks.map((t) => t.uri));




    return (
        <div className="App" >
            <h1>Jamming</h1>

            {/* Pass addTrack down to SearchResults */}

            <SearchBar onSearch={onSearch} /> 


            <SearchResults tracks={searchResults} onAddTrack={addTrack} playlistUris={playlistUris} />

            <Playlist 
                name={playlistName}
                tracks={playlistTracks}
                onNameChange={setPlaylistName}
                onRemoveTrack={removeTrack}
                onSave={savePlaylist}
                />

        </div>
    );
}