const express = require("express");
const controller = require("./research.controller");
const router = express.Router();

router.get("/tasks", controller.listTasks);
router.post("/task", controller.createTask);
router.put("/task/:id", controller.updateTask);
router.post("/evidence", controller.submitEvidence);
router.get("/evidence/:claimId", controller.listEvidence);

module.exports = router;
