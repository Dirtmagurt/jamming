import React from "react";
import Track from "./Track";

export default function TrackList({ tracks, onAddTrack, isRemoval, onRemoveTrack }) {
    return (
        <div>
      {tracks && tracks.length > 0 ? (
        tracks.map((track) => (
          <Track
            key={track.id}
            track={track}
            onAdd={onAddTrack}
            isRemoval={isRemoval}
            onRemoveTrack={onRemoveTrack}
          />
        ))
      ) : (
        <p>No tracks found.</p>
      )}
        </div>

    );
}