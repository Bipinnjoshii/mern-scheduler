export default function History({ history, onLoad, onDelete }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-eyebrow">LOG</span>
        <h2>History</h2>
      </div>

      {history.length === 0 && (
        <p className="empty-hint">Saved runs will appear here.</p>
      )}

      <div className="history-list">
        {history.map((h) => (
          <div className="history-row" key={h._id}>
            <div className="history-main" onClick={() => onLoad(h._id)}>
              <span className="history-algo">{h.algorithm}</span>
              <span className="history-name">{h.name}</span>
              <span className="history-meta">
                {h.processes.length} procs · avg wait{" "}
                {h.averages?.avgWaitingTime}
              </span>
            </div>
            <button
              className="btn-ghost-danger small"
              onClick={() => onDelete(h._id)}
              type="button"
              aria-label="Delete run"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
