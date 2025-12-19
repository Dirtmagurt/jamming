import React from "react";
import TrackList from "./Tracklist";

export default function Playlist({ name, tracks, onNameChange, onRemoveTrack, onSave, canSave }) {
  const handleNameChange = (event) => onNameChange(event.target.value);


    return (
        <div className="PlaylistPanel">
        {/* Top (non-scrolling) */}
        <input
            className="PlaylistName"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="New Playlist"
        />

        <div className="Divider" />

        {/* Middle (scrolling happens INSIDE TrackList) */}
        <div className="PlaylistListWrap">
            <TrackList tracks={tracks} onRemoveTrack={onRemoveTrack} isRemoval />
        </div>

        {/* Bottom (non-scrolling, always visible) */}
        <div className="PlaylistFooter">
            <button className="Button" onClick={onSave} disabled={!canSave}>
            {canSave ? "Save to Spotify" : "No changes to save"}
            </button>
        </div>
        </div>
  );
}
