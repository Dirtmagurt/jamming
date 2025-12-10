import React from "react";


export default function Track({name, artist, album}) {
    return (

        <div className="Track">
            <div className="Track-info">
                <h3>{name}</h3>
                <p>
                    {artist} | {album}
                </p>
            </div>
        </div>
    );
}