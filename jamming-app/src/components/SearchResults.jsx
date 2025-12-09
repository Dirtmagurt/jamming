import React from "react";
import TrackList from "./Tracklist";

export default function SearchResults({ tracks }) {
    return (
        <section>
            <h2>Search Results</h2>
            <TrackList tracks={tracks} />

        </section>
    )
};

