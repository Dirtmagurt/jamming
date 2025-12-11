import React from "react";
import TrackList from "./Tracklist";

export default function Playlist ({name, tracks, onNameChange, onRemoveTrack }) {
    // Handle playlist name change
    const handleNameChange = (event) => {
        onNameChange(event.target.value);
    };

    return (
        <section className="Playlist">
            <input type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="New Playlist"
            />


            

            <TrackList 
            tracks={tracks}
             isRemoval={true} 
             onRemoveTrack={onRemoveTrack} />

        </section>
    );
}