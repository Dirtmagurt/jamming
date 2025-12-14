import React from "react";

export default function Track({ track, onAdd, isRemoval, onRemove, isInPlaylist }) {
  const { name, artist, album } = track;

  const handleAddClick = () => onAdd?.(track);
  const handleRemoveClick = () => onRemove?.(track);

  // Search results context: hide (or disable) + if already in playlist
  const shouldShowAdd = !isRemoval && !isInPlaylist;
  const shouldShowRemove = isRemoval;

  return (
    <div className="Track">
      <div className="Track-info">
        <h3>{name}</h3>
        <p>
          {artist} | {album}
        </p>
      </div>

      {shouldShowAdd && (
        <button className="Track-action" onClick={handleAddClick}>
          +
        </button>
      )}

      {shouldShowRemove && (
        <button className="Track-action" onClick={handleRemoveClick}>
          -
        </button>
      )}
    </div>
  );
}
