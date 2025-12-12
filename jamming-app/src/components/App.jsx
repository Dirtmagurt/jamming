import React, { useState } from "react";
import SearchResults from "./SearchResults";
import Playlist from "./Playlist";
import Spotify from "../services/spotify";


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
    const [searchResults] = useState(mockSearchResults); // stand in for real API results

    const [playlistName, setPlaylistName] = useState("My Playlist");
    const [playlistTracks, setPlaylistTracks] = useState(mockPlaylistTracks);



    //Added the onSearch function
    const onSearch = async (term) => {
    try {
      const token = await Spotify.getAccessToken();
      console.log("Spotify token acquired:", token);

      // later:
      // const results = await Spotify.search(term);
      // setSearchResults(results);

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };


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

 


    };

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
    };   


    return (
        <div className="App" >
            <h1>Jamming</h1>

            {/* Pass addTrack down to SearchResults */}

            <SearchBar onSearch={onSearch} /> 


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