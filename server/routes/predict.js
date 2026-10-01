const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/predictController");

router.post("/", ctrl.predictBurstTime);
router.get("/history", ctrl.getBurstHistory);
router.delete("/history/:id", ctrl.deleteBurstHistory);

module.exports = router;
