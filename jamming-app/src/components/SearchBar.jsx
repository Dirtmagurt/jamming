import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(term.trim());
  };

  return (
    <form className="SearchBar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search songs, artists, or albums"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button className="Button" type="submit">Search</button>

    </form>
  );
}
