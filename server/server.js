require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const simulationRoutes = require("./routes/simulations");
const predictRoutes = require("./routes/predict");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/simulations", simulationRoutes);
app.use("/api/predict", predictRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
