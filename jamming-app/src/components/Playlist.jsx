import React from "react";
import TrackList from "./Tracklist";

export default function Playlist({ name, tracks, onNameChange, onRemoveTrack, onSave, canSave }) {
  const handleNameChange = (event) => onNameChange(event.target.value);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <input
        type="text"
        className="PlaylistName"
        value={name}
        onChange={handleNameChange}
        placeholder="New Playlist"
      />

      <div className="Divider" />

      {/* critical: this creates the scroll containment area */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <TrackList tracks={tracks} isRemoval={true} onRemoveTrack={onRemoveTrack} />
      </div>

      <div style={{ paddingTop: 12 }}>
        <button className="Button" onClick={onSave} disabled={!canSave}>
          {canSave ? "Save to Spotify" : "No changes to save"}
        </button>
      </div>
    </div>
  );
}
