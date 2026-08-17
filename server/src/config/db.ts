import mongoose from "mongoose";

import { env, isProduction } from "./env.js";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

if (!isProduction) {
  mongoose.set("debug", env.LOG_LEVEL === "trace");
}

export const connectDB = async (uri: string = env.MONGODB_URI): Promise<void> => {
  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
    minPoolSize: 2,
  });

  logger.info(
    { host: connection.connection.host, db: connection.connection.name },
    "MongoDB connected",
  );
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
};
