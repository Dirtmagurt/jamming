import React from "react";
import Track from "./Track";

export default function TrackList({ tracks, onAddTrack, isRemoval }) {
    return (
        <div>
      {tracks && tracks.length > 0 ? (
        tracks.map((track) => (
          <Track
            key={track.id}
            track={track}
            onAdd={onAddTrack}
            isRemoval={isRemoval}
          />
        ))
      ) : (
        <p>No tracks found.</p>
      )}
        </div>

    );
}