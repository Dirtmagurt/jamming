import React, { useState } from "react";
import SearchResults from "./SearchResults";
import Playlist from "./Playlist";


const mockSearchResults = [
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
    const [searchResults] = useState(mockSearchResults); // stand in for real API results

    const [playlistName, setPlaylistName] = useState("My Playlist");
    const [playlistTracks, setPlaylistTracks] = useState("mockPlaylistTracks");

     //Adding a Track - defining the method

    const addTrack = (track) => {
        //Check if track is already in the playlist
        const trackExists = playlistTracks.some(
            (playlistTrack) => playlistTrack.id === track.id 
            //If you switch to uri 's use playlistTrack.uri === track.uri
            );

            
        if (trackExists) {
            return; 
        }

        setPlaylistTracks((prevTracks) => [...prevTracks, track]);
    }

    const removeTrack = (track) => {
        //Again checking if track is already in the playlist
        const trackExists = playlistTracks.some(
            (playlistTrack) => playlistTrack.id === track.id

        );
        if (!trackExists) {
            return; //Nothing to be removed
        }

        //A new array without the removed track is created.
        setPlaylistTracks((prevTracks) => 
            prevTracks.filter(
                (playlistTrack) => playlistTrack.id !== track.id
            )
        );    

    // Save Playlist (mock)
    const savePlaylist = () => {
        //creating an array of URIs for Spotify
        const trackUris = playlistTracks.map((track) => track.uri);

        //Mock API call
        console.log("Saving playlist to Spotify (mock)", {
            name: playlistName,
            uris: trackUris,
        });

        //Resets playlist after export
        setPlaylistName("New Playlist");
        setPlaylistTracks([]);
    }    


    };


    return (
        <div className="App" >
            <h1>Jamming</h1>

            {/* Pass addTrack down to SearchResults */}

            <SearchResults tracks={searchResults} onAddTrack={addTrack} />

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