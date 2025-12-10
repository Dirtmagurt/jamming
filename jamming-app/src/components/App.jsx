import React from "react";
import SearchResults from "./SearchResults";
import Playlist from "./Playlist";


const mockSearchResutls = [
    {
        id: 1,
        name: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
    },

    {
        id: 2,
        name: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
    },

    {
        id: 3,
        name: "Watermelon Sugar",
        artist: "Harry Styles",
        album: "Fine Line",
    },
];

const mockPlaylistTracks = [
     { id: 101, name: "Save Your Tears", artist: "The Weeknd", album: "After Hours" },
    { id: 102, name: "Don’t Start Now", artist: "Dua Lipa", album: "Future Nostalgia" },

]

export  default function App() {
    const searchResults = mockSearchResutls; // stand in for real API results

    const [playlistName, setPlaylistName] = useState("My Playlist");
    const [playlistTracks, setPlaylistTracks] = useState("mockPlaylistTracks");


    return (
        <div className="App" >
            <h1>Jamming</h1>

            <SearchResults tracks={searchResults} />

            <Playlist 
                name={playlistName}
                tracks={playlistTracks}
                onNameChange={setPlaylistName}
                ///onRemoveTrack, onSave will come later
                />

        </div>
    );
}