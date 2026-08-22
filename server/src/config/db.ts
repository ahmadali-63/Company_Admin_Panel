import mongoose from "mongoose";

import { env, isProduction } from "./env.js";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

if (!isProduction) {
  mongoose.set("debug", env.LOG_LEVEL === "trace");
}

let mongodInstance: any = null;

export const connectDB = async (uri: string = env.MONGODB_URI): Promise<void> => {
  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3_000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });

    logger.info(
      { host: connection.connection.host, db: connection.connection.name },
      "MongoDB connected",
    );
  } catch (error) {
    if (!isProduction) {
      logger.warn(
        { err: error },
        "Could not connect to configured MongoDB URI. Launching embedded MongoMemoryServer for development...",
      );
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();

        const connection = await mongoose.connect(memoryUri);
        logger.info(
          { uri: memoryUri, db: connection.connection.name },
          "Embedded MongoDB (MongoMemoryServer) started and connected successfully.",
        );
        return;
      } catch (memErr) {
        logger.error({ err: memErr }, "Failed to start MongoMemoryServer fallback");
        throw error;
      }
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  }
  if (mongodInstance) {
    await mongodInstance.stop();
    logger.info("Embedded MongoDB stopped");
  }
};
