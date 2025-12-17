import React from "react";
import Track from "./Track";

export default function TrackList({ tracks, onAddTrack, isRemoval, onRemoveTrack, playlistUris }) {
  return (
    <div className="TrackList" >
      {tracks && tracks.length > 0 ? (
        tracks.map((track) => (
          <Track
            key={track.uri}
            track={track}
            onAdd={onAddTrack}
            onRemove={onRemoveTrack}
            isRemoval={isRemoval}
            isInPlaylist={playlistUris ? playlistUris.has(track.uri) : false}
          />
        ))
      ) : (
        <p className="EmptyStaate" >No tracks found.</p>
      )}
    </div>
  );
}
