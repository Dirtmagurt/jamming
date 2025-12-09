import React from "react";
import SearchResults from "./SearchResults";

const mockSearchResutls = [
    {
        id: 1,
        name: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
    },

    {
        id: 2,
        name: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
    },

    {
        id: 3,
        name: "Watermelon Sugar",
        artist: "Harry Styles",
        album: "Fine Line",
    },
];

export  default function App() {
    const searchResults = mockSearchResutls; // stand in for real API results

    return (
        <div className="App" >
            <h1>Jamming</h1>

            <SearchResults tracks={searchResults} />
        </div>
    );
}