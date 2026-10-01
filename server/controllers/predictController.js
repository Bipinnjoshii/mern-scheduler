const axios = require("axios");
const BurstHistory = require("../models/BurstHistory");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// POST /api/predict
// Body: { processLabel: "Compiler", history: [5,7,6,8,7] }
// Calls the Python microservice for a prediction, then saves/updates the
// labeled process's history + prediction in MongoDB.
exports.predictBurstTime = async (req, res) => {
  try {
    const { processLabel, history } = req.body;

    if (!processLabel || typeof processLabel !== "string") {
      return res.status(400).json({ error: "processLabel is required" });
    }
    if (!Array.isArray(history) || history.length < 2) {
      return res
        .status(400)
        .json({ error: "history must be an array of at least 2 numbers" });
    }

    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, { history });
    } catch (err) {
      // The Python service being down is a distinct, common failure mode
      // (separate process, separate terminal) -- surface that clearly.
      return res.status(502).json({
        error:
          "Could not reach the ML prediction service. Is ml-service/app.py running?",
        detail: err.message,
      });
    }

    const prediction = mlResponse.data;

    const record = await BurstHistory.findOneAndUpdate(
      { processLabel },
      {
        processLabel,
        history,
        lastPrediction: {
          predictedBurstTime: prediction.predictedBurstTime,
          mse: prediction.mse ?? null,
          slope: prediction.slope,
          intercept: prediction.intercept,
        },
      },
      { upsert: true, new: true }
    );

    res.json({ ...prediction, saved: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/predict/history -> list all labeled processes with saved history
exports.getBurstHistory = async (req, res) => {
  try {
    const records = await BurstHistory.find().sort({ updatedAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/predict/history/:id
exports.deleteBurstHistory = async (req, res) => {
  try {
    const deleted = await BurstHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
};
