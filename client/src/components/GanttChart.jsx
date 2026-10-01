export default function GanttChart({ timeline, processes }) {
  if (!timeline || timeline.length === 0) return null;

  const colorMap = Object.fromEntries(processes.map((p) => [p.pid, p.color]));
  const totalTime = Math.max(...timeline.map((s) => s.end));
  const ticks = Array.from({ length: totalTime + 1 }, (_, i) => i);

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-eyebrow">03</span>
        <h2>Execution Trace</h2>
      </div>

      <div className="gantt-scroll">
        <div
          className="gantt-track"
          style={{ width: `${totalTime * 42}px` }}
        >
          {timeline.map((seg, i) => {
            const width = (seg.end - seg.start) * 42;
            return (
              <div
                key={i}
                className="gantt-block"
                style={{
                  width: `${width}px`,
                  background: colorMap[seg.pid] || "#888",
                }}
                title={`${seg.pid}: ${seg.start} → ${seg.end}`}
              >
                <span>{seg.pid}</span>
              </div>
            );
          })}
        </div>

        <div className="gantt-ruler" style={{ width: `${totalTime * 42}px` }}>
          {ticks.map((t) => (
            <span key={t} className="tick" style={{ left: `${t * 42}px` }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="legend">
        {processes.map((p) => (
          <span className="legend-item" key={p.pid}>
            <span className="swatch" style={{ background: p.color }} />
            {p.pid}
          </span>
        ))}
      </div>
    </div>
  );
}
