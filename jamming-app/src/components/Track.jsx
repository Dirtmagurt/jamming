import React from "react";

export default function Track({ track, onAdd, isRemoval, onRemove, isInPlaylist }) {
  const { name, artist, album } = track;

  const handleAddClick = () => onAdd?.(track);
  const handleRemoveClick = () => onRemove?.(track);

  const showAdd = !isRemoval && !isInPlaylist;
  const showRemove = isRemoval;

  return (
    <div className="Track">
      <div className="Track-info">
        <h3>{name}</h3>
        <p>{artist} | {album}</p>
      </div>

      {showAdd && (
        <button className="Track-action" onClick={handleAddClick}>
          +
        </button>
      )}

      {showRemove && (
        <button className="Track-action" onClick={handleRemoveClick}>
          -
        </button>
      )}
    </div>
  );
}

