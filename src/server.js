require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
console.log("Loaded PORT:", process.env.PORT);
console.log("Loaded Mongo URI:", process.env.MONGODB_URI);

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`\n✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});
