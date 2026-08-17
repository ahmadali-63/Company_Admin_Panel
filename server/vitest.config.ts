import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // `src/config/env.ts` validates and exits on a bad environment, so the
    // suite supplies its own values instead of reading the developer's .env.
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://127.0.0.1:27017/placeholder",
      JWT_SECRET: "test-access-secret-that-is-long-enough-000000",
      JWT_REFRESH_SECRET: "test-refresh-secret-that-is-long-enough-00000",
      JWT_EXPIRES_IN: "15m",
      JWT_REFRESH_EXPIRES_IN: "7d",
      LOG_LEVEL: "silent",
    },
    // An in-memory Mongo instance has to spin up before the first suite.
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // Each file shares one in-memory server — run files serially.
    fileParallelism: false,
  },
});
