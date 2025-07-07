const cron = require("node-cron");
const influencerService = require("./modules/influencers/influencers.service");

// Runs every day at midnight (server time)
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Starting scheduled Twitter profile updates...");
    await influencerService.updateAllProfilesFromTwitter();
    console.log("All influencer profiles updated from Twitter.");
  } catch (err) {
    console.error("Error updating influencer profiles:", err);
  }
});
