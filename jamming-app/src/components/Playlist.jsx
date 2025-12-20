import React from "react";
import TrackList from "./Tracklist";

export default function Playlist({ name, tracks, onNameChange, onRemoveTrack, onSave, canSave, isEditingExisting, onStartNew }) {
  const handleNameChange = (event) => onNameChange(event.target.value);


    return (
        <div className="PlaylistPanel">
        {/* Top (non-scrolling) */}
                <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
            }}
            >
            <span style={{ fontSize: 14, opacity: 0.85 }}>
                {isEditingExisting ? "Editing Playlist" : "New Playlist"}
            </span>

            {isEditingExisting && (
                <button
                type="button"
                className="Button"
                onClick={onStartNew}
                style={{
                    padding: "6px 10px",
                    fontSize: 12,
                }}
                >
                New Playlist
                </button>
        )}
        </div>



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
