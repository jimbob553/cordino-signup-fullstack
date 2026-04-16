// express is the web server framework
import express from "express";
// permissions for different ports
import cors from "cors";
// loads environment variables from .env file (configuration loader)
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "../routes/userRoutes.js";

// load env vars
dotenv.config();


const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());
// connect to database
await connectDB();
// health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// mount routes
app.use("/api/users", userRoutes);
// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

