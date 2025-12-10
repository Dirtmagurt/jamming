import React from "react";


export default function Track({track, onAdd, isRemoval }) {
    const { name, artist, album } = track;
    
    const handleAddClick = () => {
        if (onAdd) {
            onAdd(track);
        }
    }
    
    //Placeholder for isRemoval

    return (

        <div className="Track">
            <div className="Track-info">
                <h3>{name}</h3>
                <p>
                    {artist} | {album}
                </p>
            </div>

            {/*Show + button when this is NOT a removal context (search results) */}
            {!isRemoval && (
                <button className="Track-action" onClick={handleAddClick}>
                    +
                </button>
            )}




        </div>
    );
}