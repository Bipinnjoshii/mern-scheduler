export default function MetricsTable({ metrics, averages }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-eyebrow">04</span>
        <h2>Metrics</h2>
      </div>

      <table className="metrics-table">
        <thead>
          <tr>
            <th>PID</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Completion</th>
            <th>Turnaround</th>
            <th>Waiting</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.pid}>
              <td className="mono-strong">{m.pid}</td>
              <td>{m.arrivalTime}</td>
              <td>{m.burstTime}</td>
              <td>{m.completionTime}</td>
              <td>{m.turnaroundTime}</td>
              <td>{m.waitingTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="averages-row">
        <div className="avg-stat">
          <span className="avg-label">Avg Waiting Time</span>
          <span className="avg-value">{averages.avgWaitingTime}</span>
        </div>
        <div className="avg-stat">
          <span className="avg-label">Avg Turnaround Time</span>
          <span className="avg-value">{averages.avgTurnaroundTime}</span>
        </div>
      </div>
    </div>
  );
}
