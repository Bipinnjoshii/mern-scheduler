const mongoose = require("mongoose");

// Stores a labeled process's burst-time history over time, so the ML
// service has real historical data (from MongoDB) to train on, rather
// than one-off numbers typed in each time.
const BurstHistorySchema = new mongoose.Schema(
  {
    processLabel: { type: String, required: true, trim: true },
    history: { type: [Number], required: true },
    lastPrediction: {
      predictedBurstTime: Number,
      mse: Number,
      slope: Number,
      intercept: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BurstHistory", BurstHistorySchema);
