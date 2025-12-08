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

// NEW: Fetch all influencer posts and create claims
router.post("/fetch-all-posts", controller.fetchAllInfluencerPosts);

// NEW: Fetch posts from a single influencer
router.post("/fetch-influencer-posts/:influencerId", controller.fetchInfluencerPosts);

// NEW: AI Verification endpoints
router.post("/:id/verify-ai", controller.verifyClaimWithAI);
router.post("/verify-multiple-ai", controller.verifyMultipleClaimsWithAI);
router.post("/verify-pending-ai", controller.verifyAllPendingClaims);

module.exports = router;
