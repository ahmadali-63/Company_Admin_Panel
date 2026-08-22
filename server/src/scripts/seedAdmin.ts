import { seedDatabase } from "./seedAll.js";
import { disconnectDB } from "../config/db.js";
import { logger } from "../config/logger.js";

seedDatabase()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error({ err: error }, "Seed failed");
    await disconnectDB();
    process.exit(1);
  });
