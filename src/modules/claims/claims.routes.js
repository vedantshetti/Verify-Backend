const express = require("express");
const controller = require("./claims.controller");
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.post("/:id/verify", controller.verifyClaim);

module.exports = router;
