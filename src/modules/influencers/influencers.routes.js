const express = require("express");
const controller = require("./influencers.controller");
const router = express.Router();

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.get("/:id/posts", controller.getPosts);
router.post("/:id/fetch", controller.fetchAndStorePosts);

// NEW: Optional route to manually trigger all-profiles update
router.post("/update-all-twitter", controller.updateAllProfilesFromTwitter);

// these routes are for the cron job to update all profiles from Twitter
// This is useful for testing or manual triggering
router.post("/update-all-twitter", controller.updateAllProfilesFromTwitter);

module.exports = router;
