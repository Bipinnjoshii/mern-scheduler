const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/simulationController");

router.post("/run", ctrl.runSimulation);
router.post("/", ctrl.createSimulation);
router.get("/", ctrl.getSimulations);
router.get("/:id", ctrl.getSimulationById);
router.delete("/:id", ctrl.deleteSimulation);

module.exports = router;
