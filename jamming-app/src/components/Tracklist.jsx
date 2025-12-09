import React from "react";
import Track from "./Track";

export default function TrackList({ tracks }) {
    return (
        <div>
      {tracks && tracks.length > 0 ? (
        tracks.map((track) => (
          <Track
            key={track.id}
            name={track.name}
            artist={track.artist}
            album={track.album}
          />
        ))
      ) : (
        <p>No tracks found.</p>
      )}
        </div>

    );
}