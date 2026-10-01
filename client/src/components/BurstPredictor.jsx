import { useState } from "react";
import { predictBurstTime } from "../api.js";

export default function BurstPredictor({ onAddProcess }) {
  const [label, setLabel] = useState("Compiler");
  const [historyText, setHistoryText] = useState("5, 7, 6, 8, 7");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setPrediction(null);
    try {
      const history = historyText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);

      if (history.some((n) => Number.isNaN(n))) {
        throw new Error("History must be comma-separated numbers");
      }
      if (history.length < 2) {
        throw new Error("Enter at least 2 past burst times");
      }

      const result = await predictBurstTime({ processLabel: label, history });
      setPrediction(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = () => {
    if (!prediction) return;
    onAddProcess({
      pid: label.slice(0, 6) || "PRED",
      arrivalTime: 0,
      burstTime: Math.round(prediction.predictedBurstTime),
    });
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-eyebrow">ML</span>
        <h2>Burst Time Predictor</h2>
      </div>
      <p className="empty-hint" style={{ marginBottom: 12 }}>
        Predicts a process's next burst time from its past behavior, using
        linear regression — instead of assuming burst time is already known.
      </p>

      <form onSubmit={handlePredict}>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Process Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--panel-border)",
              color: "var(--text)",
              borderRadius: 4,
              padding: "7px 8px",
              fontFamily: "var(--mono)",
              fontSize: 13,
              width: "100%",
            }}
          />
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Past Burst Times (comma-separated)</label>
          <input
            type="text"
            value={historyText}
            onChange={(e) => setHistoryText(e.target.value)}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--panel-border)",
              color: "var(--text)",
              borderRadius: 4,
              padding: "7px 8px",
              fontFamily: "var(--mono)",
              fontSize: 13,
              width: "100%",
            }}
          />
        </div>
        <button type="submit" className="btn-accent" disabled={loading}>
          {loading ? "Predicting…" : "Predict Next Burst Time"}
        </button>
      </form>

      {error && (
        <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 10 }}>
          ⚠ {error}
        </p>
      )}

      {prediction && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px dashed var(--panel-border)",
          }}
        >
          <div className="averages-row" style={{ marginTop: 0 }}>
            <div className="avg-stat">
              <span className="avg-label">Predicted Burst Time</span>
              <span className="avg-value">
                {prediction.predictedBurstTime}
              </span>
            </div>
            {prediction.mse !== null && prediction.mse !== undefined && (
              <div className="avg-stat">
                <span className="avg-label">Model MSE</span>
                <span className="avg-value">{prediction.mse}</span>
              </div>
            )}
          </div>
          <p className="empty-hint" style={{ marginTop: 8 }}>
            Regression line: burst ≈ {prediction.slope} × t + {prediction.intercept}
          </p>
          <button
            type="button"
            className="btn-outline"
            style={{ marginTop: 8 }}
            onClick={handleAddToQueue}
          >
            + Add as process to queue
          </button>
        </div>
      )}
    </div>
  );
}
