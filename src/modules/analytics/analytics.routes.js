const express = require("express");
const controller = require("./analytics.controller");
const router = express.Router();

router.get("/leaderboard", controller.leaderboard);
router.get("/trends", controller.trends);
router.get("/categories", controller.categories);
router.get("/summary", controller.summary);
router.get("/influencer/:id", controller.influencer);

module.exports = router;
