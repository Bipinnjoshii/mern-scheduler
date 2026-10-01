const ALGORITHMS = [
  { id: "FCFS", label: "First Come First Serve", tag: "non-preemptive" },
  { id: "SJF", label: "Shortest Job First", tag: "non-preemptive" },
  { id: "SRTF", label: "Shortest Remaining Time First", tag: "preemptive" },
  { id: "RR", label: "Round Robin", tag: "preemptive" },
];

export default function AlgorithmPicker({
  algorithm,
  setAlgorithm,
  quantum,
  setQuantum,
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-eyebrow">02</span>
        <h2>Algorithm</h2>
      </div>

      <div className="algo-grid">
        {ALGORITHMS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`algo-btn ${algorithm === a.id ? "active" : ""}`}
            onClick={() => setAlgorithm(a.id)}
          >
            <span className="algo-id">{a.id}</span>
            <span className="algo-label">{a.label}</span>
            <span className="algo-tag">{a.tag}</span>
          </button>
        ))}
      </div>

      {algorithm === "RR" && (
        <div className="quantum-row">
          <label>Time Quantum</label>
          <input
            type="number"
            min="1"
            value={quantum}
            onChange={(e) => setQuantum(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
