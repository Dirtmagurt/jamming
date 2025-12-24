import React from "react";
import TrackList from "./Tracklist";

export default function SearchResults({ tracks, onAddTrack, playlistUris }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, flex: 1 }}>
      <h2 style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>Search Results</h2>
      <TrackList
        tracks={tracks}
        onAddTrack={onAddTrack}
        isRemoval={false}
        playlistUris={playlistUris}
      />
    </div>
  );
}

