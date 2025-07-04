const express = require("express");
const controller = require("./claims.controller");
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.post("/:id/verify", controller.verifyClaim);
router.post("/verify-on-demand/:id", controller.verifyOnDemand);
router.post("/get-or-verify", controller.getOrVerifyClaim);

module.exports = router;
