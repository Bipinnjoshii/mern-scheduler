import { useEffect, useState } from "react";
import ProcessForm from "./components/ProcessForm.jsx";
import AlgorithmPicker from "./components/AlgorithmPicker.jsx";
import GanttChart from "./components/GanttChart.jsx";
import MetricsTable from "./components/MetricsTable.jsx";
import History from "./components/History.jsx";
import BurstPredictor from "./components/BurstPredictor.jsx";
import {
  runSimulation,
  saveSimulation,
  fetchHistory,
  fetchSimulation,
  deleteSimulation,
} from "./api.js";

const DEFAULT_PROCESSES = [
  { pid: "P1", arrivalTime: 0, burstTime: 5, color: "#F2A65A" },
  { pid: "P2", arrivalTime: 1, burstTime: 3, color: "#5B8DEF" },
  { pid: "P3", arrivalTime: 2, burstTime: 8, color: "#4FD1C5" },
  { pid: "P4", arrivalTime: 3, burstTime: 6, color: "#E85D75" },
];

export default function App() {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState("FCFS");
  const [quantum, setQuantum] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    fetchHistory()
      .then(setHistory)
      .catch(() => setHistory([]));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRun = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await runSimulation({ algorithm, processes, quantum });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Simulation failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await saveSimulation({
        name: `${algorithm} · ${processes.length} processes`,
        algorithm,
        processes,
        quantum,
      });
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    }
  };

  const handleLoad = async (id) => {
    try {
      const sim = await fetchSimulation(id);
      setProcesses(sim.processes);
      setAlgorithm(sim.algorithm);
      setQuantum(sim.quantum || 2);
      setResult(sim);
    } catch {
      setError("Could not load that run");
    }
  };

  const handleDelete = async (id) => {
    await deleteSimulation(id);
    loadHistory();
  };

  const handleAddPredictedProcess = (proc) => {
    // Ensure the pid is unique among current processes
    let pid = proc.pid;
    let n = 2;
    while (processes.some((p) => p.pid === pid)) {
      pid = `${proc.pid}${n++}`;
    }
    const color = ["#F2A65A","#5B8DEF","#4FD1C5","#E85D75","#9B7EDE","#7BC96F","#EAD84F","#FF8FA3"][processes.length % 8];
    setProcesses([...processes, { ...proc, pid, color }]);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◧</span>
          <div>
            <h1>SCHED</h1>
            <p>CPU Scheduling Algorithm Simulator — MERN</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn-outline" onClick={handleSave} disabled={!result}>
            Save Run
          </button>
          <button className="btn-accent large" onClick={handleRun} disabled={loading || processes.length === 0}>
            {loading ? "Running…" : "▶ Run Simulation"}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">⚠ {error}</div>}

      <main className="layout">
        <div className="col-left">
          <ProcessForm processes={processes} setProcesses={setProcesses} />
          <AlgorithmPicker
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            quantum={quantum}
            setQuantum={setQuantum}
          />
          <History history={history} onLoad={handleLoad} onDelete={handleDelete} />
          <BurstPredictor onAddProcess={handleAddPredictedProcess} />
        </div>

        <div className="col-right">
          {result ? (
            <>
              <GanttChart timeline={result.timeline} processes={processes} />
              <MetricsTable metrics={result.metrics} averages={result.averages} />
            </>
          ) : (
            <div className="panel empty-state">
              <p>Configure your process queue and hit “Run Simulation”.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
