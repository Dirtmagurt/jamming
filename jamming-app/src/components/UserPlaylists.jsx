import React from "react";

export default function UserPlaylists({ playlists = [], isLoading, error }) {
  if (isLoading) return <p className="EmptyState">Loading playlists...</p>;
  if (error) return <p className="EmptyState">Error: {error}</p>;
  if (!playlists.length) return <p className="EmptyState">No playlists found.</p>;

  return (
    <div className="TrackList">
      {playlists.map((p) => (
        <div className="Track" key={p.id}>
          <div className="Track-info">
            <h3>{p.name}</h3>
            <p>
              {p.owner} • {p.trackCount} tracks
            </p>
          </div>

          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt=""
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  "linear-gradient(135deg, rgba(103,232,249,0.18), rgba(167,139,250,0.14))",
                display: "grid",
                placeItems: "center",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 800,
                fontSize: 14,
              }}
              aria-label="No playlist image"
            >
              {p.name?.trim()?.[0]?.toUpperCase() || "♪"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}



