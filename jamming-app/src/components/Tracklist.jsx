import React from "react";
import Track from "./Track";

export default function TrackList({ tracks, onAddTrack, isRemoval, onRemoveTrack, playlistUris }) {
    return (
        <div>
      {tracks && tracks.length > 0 ? (
        tracks.map((track) => (
          <Track
            key={track.uri}
            track={track}
            onAdd={onAddTrack}
            isRemoval={isRemoval}
            onRemoveTrack={onRemoveTrack}
            isInPlaylist={playlistUris ? playlistUris.has(track.uri) : false}
          />
        ))
      ) : (
        <p>No tracks found.</p>
      )}
        </div>

    );
}