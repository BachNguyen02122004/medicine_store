require("dotenv").config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  },

  // Security configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    credentials: true,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT) || 10,
    maxLimit: parseInt(process.env.MAX_LIMIT) || 100,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    logToFile: process.env.LOG_TO_FILE === "true",
  },
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

module.exports = config;
