const { Pool } = require("pg");
const logger = require("../utils/logger");

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      this.isConnected = true;
      logger.info("✅ Database connected successfully");

      // Handle pool errors
      this.pool.on("error", (err) => {
        logger.error("Unexpected error on idle client", err);
        this.isConnected = false;
      });
    } catch (error) {
      logger.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.isConnected = false;
        logger.info("Database disconnected");
      }
    } catch (error) {
      logger.error("Error disconnecting from database:", error);
      throw error;
    }
  }

  getPool() {
    if (!this.pool || !this.isConnected) {
      throw new Error("Database not connected");
    }
    return this.pool;
  }

  async query(text, params = []) {
    if (!this.pool || !this.isConnected) {
      throw new Error("Database not connected");
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug(`Query executed in ${duration}ms: ${text}`);
      return result;
    } catch (error) {
      logger.error("Database query error:", {
        text,
        params,
        error: error.message,
      });
      throw error;
    }
  }
}

const database = new Database();

module.exports = database;
