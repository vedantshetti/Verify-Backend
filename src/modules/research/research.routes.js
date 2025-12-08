const express = require("express");
const controller = require("./research.controller");
const router = express.Router();

router.get("/tasks", controller.listTasks);
router.post("/task", controller.createTask);
router.put("/task/:id", controller.updateTask);
router.post("/evidence", controller.submitEvidence);
router.get("/evidence/:claimId", controller.listEvidence);

// Research Report routes
router.post("/report", controller.generateReport);
router.get("/reports", controller.listReports);
router.get("/report/:id", controller.getReport);
router.delete("/report/:id", controller.deleteReport);

module.exports = router;
