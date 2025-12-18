import React from "react";
import TrackList from "./Tracklist";

export default function Playlist ({name, tracks, onNameChange, onRemoveTrack, onSave }) {
    // Handle playlist name change
    const handleNameChange = (event) => {
        onNameChange(event.target.value);
    };

    return (
        <section className="Playlist">
            {/* Editable playlist title */}
            <input type="text"
            className="PlaylistName"
            value={name}                 // controlled by App state
            onChange={handleNameChange}  //updates App state on each keystrok
            placeholder="New Playlist"
            />


            

            <TrackList 
            tracks={tracks}
             isRemoval={true} 
             onRemoveTrack={onRemoveTrack} />


           <button className="Button" onClick={onSave} disabled={!tracks.length}>
                Save to Spotify
                </button>
 

        </section>
    );
}