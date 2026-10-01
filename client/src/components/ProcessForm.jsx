import { useState } from "react";

const PALETTE = [
  "#F2A65A",
  "#5B8DEF",
  "#4FD1C5",
  "#E85D75",
  "#9B7EDE",
  "#7BC96F",
  "#EAD84F",
  "#FF8FA3",
];

let pidCounter = 1;

export default function ProcessForm({ processes, setProcesses }) {
  const [arrival, setArrival] = useState(0);
  const [burst, setBurst] = useState(4);

  const addProcess = (e) => {
    e.preventDefault();
    const nextPid = `P${pidCounter++}`;
    const color = PALETTE[processes.length % PALETTE.length];
    setProcesses([
      ...processes,
      { pid: nextPid, arrivalTime: Number(arrival), burstTime: Number(burst), color },
    ]);
    setArrival(0);
    setBurst(4);
  };

  const removeProcess = (pid) => {
    setProcesses(processes.filter((p) => p.pid !== pid));
  };

  const updateProcess = (pid, field, value) => {
    setProcesses(
      processes.map((p) =>
        p.pid === pid ? { ...p, [field]: Number(value) } : p
      )
    );
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-eyebrow">01</span>
        <h2>Process Queue</h2>
      </div>

      <form className="add-row" onSubmit={addProcess}>
        <div className="field">
          <label>Arrival</label>
          <input
            type="number"
            min="0"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Burst</label>
          <input
            type="number"
            min="1"
            value={burst}
            onChange={(e) => setBurst(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-accent">
          + Add
        </button>
      </form>

      <div className="process-list">
        {processes.length === 0 && (
          <p className="empty-hint">No processes queued yet. Add one above.</p>
        )}
        {processes.map((p) => (
          <div className="process-row" key={p.pid}>
            <span className="swatch" style={{ background: p.color }} />
            <span className="pid">{p.pid}</span>
            <label className="inline-field">
              AT
              <input
                type="number"
                min="0"
                value={p.arrivalTime}
                onChange={(e) =>
                  updateProcess(p.pid, "arrivalTime", e.target.value)
                }
              />
            </label>
            <label className="inline-field">
              BT
              <input
                type="number"
                min="1"
                value={p.burstTime}
                onChange={(e) =>
                  updateProcess(p.pid, "burstTime", e.target.value)
                }
              />
            </label>
            <button
              className="btn-ghost-danger"
              onClick={() => removeProcess(p.pid)}
              aria-label={`Remove ${p.pid}`}
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
