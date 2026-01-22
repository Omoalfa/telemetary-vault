import express from "express";
import { AppDataSource } from "./data-source";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import ingestRoutes from "./routes/ingest.routes";
import queryRoutes from "./routes/query.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/ingest", ingestRoutes);
app.use("/query", queryRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting server", error);
    process.exit(1);
  }
};

startServer();
