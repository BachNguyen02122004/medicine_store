const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const config = require("./src/config/config");
const database = require("./src/config/database");
const logger = require("./src/utils/logger");
const requestLogger = require("./src/middleware/requestLogger");
const {
  globalErrorHandler,
  AppError,
} = require("./src/middleware/errorHandler");

// Import routes
const thuocRoutes = require("./src/routes/thuocRoutes");
const benhNhanRoutes = require("./src/routes/benhNhanRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");

class App {
  constructor() {
    this.app = express();
    this.port = config.port;

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializeDatabase() {
    try {
      await database.connect();
    } catch (error) {
      logger.error("Failed to initialize database:", error);
      process.exit(1);
    }
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // Compression middleware
    this.app.use(compression());

    // CORS middleware
    this.app.use(cors(config.cors));

    // Body parser middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging middleware
    this.app.use(requestLogger);
  }

  initializeRoutes() {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use("/api/thuoc", thuocRoutes);
    this.app.use("/api/benhnhan", benhNhanRoutes);
    this.app.use("/api/prescriptions", prescriptionRoutes);
    this.app.use("/api/dichvu", serviceRoutes);

    // Handle undefined routes
    this.app.all("*", (req, res, next) => {
      next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });
  }

  initializeErrorHandling() {
    this.app.use(globalErrorHandler);
  }

  start() {
    this.app.listen(this.port, () => {
      logger.info(
        `✅ Server running on port ${this.port} in ${config.nodeEnv} mode`
      );
    });
  }

  gracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      try {
        await database.disconnect();
        logger.info("Database disconnected");
        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }
}

// Initialize and start the application
const app = new App();
app.start();
app.gracefulShutdown();

module.exports = app;
