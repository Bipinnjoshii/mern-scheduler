const Simulation = require("../models/Simulation");
const { runAlgorithm } = require("../lib/scheduling");

// POST /api/simulations/run  -> compute only, don't persist
exports.runSimulation = (req, res) => {
  try {
    const { algorithm, processes, quantum } = req.body;
    validateInput(algorithm, processes);
    const result = runAlgorithm(algorithm, processes, quantum);
    res.json({ algorithm, quantum: quantum || null, processes, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/simulations -> compute + save
exports.createSimulation = async (req, res) => {
  try {
    const { name, algorithm, processes, quantum } = req.body;
    validateInput(algorithm, processes);
    const result = runAlgorithm(algorithm, processes, quantum);

    const simulation = await Simulation.create({
      name: name || `${algorithm} run`,
      algorithm,
      quantum: quantum || 2,
      processes,
      timeline: result.timeline,
      metrics: result.metrics,
      averages: result.averages,
    });

    res.status(201).json(simulation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/simulations -> history list (most recent first)
exports.getSimulations = async (req, res) => {
  try {
    const simulations = await Simulation.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(simulations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/simulations/:id
exports.getSimulationById = async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) return res.status(404).json({ error: "Not found" });
    res.json(simulation);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
};

// DELETE /api/simulations/:id
exports.deleteSimulation = async (req, res) => {
  try {
    const deleted = await Simulation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
};

function validateInput(algorithm, processes) {
  const valid = ["FCFS", "SJF", "SRTF", "RR"];
  if (!valid.includes(algorithm)) {
    throw new Error(`algorithm must be one of ${valid.join(", ")}`);
  }
  if (!Array.isArray(processes) || processes.length === 0) {
    throw new Error("processes must be a non-empty array");
  }
  const pids = new Set();
  for (const p of processes) {
    if (!p.pid) throw new Error("each process needs a pid");
    if (pids.has(p.pid)) throw new Error(`duplicate pid: ${p.pid}`);
    pids.add(p.pid);
    if (typeof p.arrivalTime !== "number" || p.arrivalTime < 0) {
      throw new Error(`invalid arrivalTime for ${p.pid}`);
    }
    if (typeof p.burstTime !== "number" || p.burstTime <= 0) {
      throw new Error(`invalid burstTime for ${p.pid}`);
    }
  }
}
