import React from "react";

export default function UserPlaylists({ playlists, isLoading, error }) {
  return (
    <div>
      <div className="Panel-header">
        <div className="Panel-title">
          Your Playlists
          <span className="Panel-meta">
            {playlists?.length || 0} total
          </span>
        </div>
      </div>

      <div className="Panel-body">
        {isLoading && <p className="EmptyState">Loading playlists...</p>}

        {!isLoading && error && (
          <p className="EmptyState">Error: {error}</p>
        )}

        {!isLoading && !error && (!playlists || playlists.length === 0) && (
          <p className="EmptyState">No playlists found.</p>
        )}

        {!isLoading && !error && playlists?.length > 0 && (
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
                      background: "rgba(255,255,255,0.05)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
