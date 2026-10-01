const mongoose = require("mongoose");

const ProcessSchema = new mongoose.Schema(
  {
    pid: { type: String, required: true },
    arrivalTime: { type: Number, required: true, min: 0 },
    burstTime: { type: Number, required: true, min: 1 },
    color: { type: String, default: "#6366f1" },
  },
  { _id: false }
);

const SimulationSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Untitled Simulation" },
    algorithm: {
      type: String,
      enum: ["FCFS", "SJF", "SRTF", "RR"],
      required: true,
    },
    quantum: { type: Number, default: 2 },
    processes: { type: [ProcessSchema], required: true },
    timeline: { type: Array, required: true },
    metrics: { type: Array, required: true },
    averages: {
      avgWaitingTime: Number,
      avgTurnaroundTime: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Simulation", SimulationSchema);
