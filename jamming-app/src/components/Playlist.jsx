import React from "react";
import TrackList from "./Tracklist";

export default function Playlist ({name, tracks, onNameChange, onRemoveTrack }) {
    // Handle playlist name change
    const handleNameChange = (event) => {
        onNameChange(event.target.value);
    };

    return (
        <section className="Playlist">
            {/* Editable playlist title */}
            <input type="text"
            value={name}                 // controlled by App state
            onChange={handleNameChange}  //updates App state on each keystrok
            placeholder="New Playlist"
            />


            

            <TrackList 
            tracks={tracks}
             isRemoval={true} 
             onRemoveTrack={onRemoveTrack} />

        </section>
    );
}