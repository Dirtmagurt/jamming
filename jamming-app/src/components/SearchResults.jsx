import React from "react";
import TrackList from "./Tracklist";

export default function SearchResults({ tracks, onAddTrack, playlistUris }) {
  return (
    <section>
      <h2>Search Results</h2>
      <TrackList
        tracks={tracks}
        onAddTrack={onAddTrack}
        isRemoval={false}
        playlistUris={playlistUris}
      />
    </section>
  );
}

