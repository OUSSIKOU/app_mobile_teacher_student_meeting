const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const os = require("os");
// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const meetingRoutes = require("./routes/meetings");
const messageRoutes = require("./routes/messages");
const { getFirstLocalIPv4 } = require("./middleware/getIpHost");
// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // or "http://localhost:3000" for stricter setup
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/easystudy", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/messages", messageRoutes);
app.get("/config", (req, res) => {
  res.json({ ip, port: PORT });
});
// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Easy Study API Server is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// appliquer le middleware globalement
// app.use(ipMiddleware);

const PORT = process.env.PORT || 5000;

// function getFirstLocalIPv4() {
//   const nets = os.networkInterfaces();
//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name]) {
//       if (net.family === "IPv4" && !net.internal) {
//         return net.address;
//       }
//     }
//   }
//   return null;
// }

const ip = getFirstLocalIPv4();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${ip}:${PORT}`);
});

module.exports = app;
