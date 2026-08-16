import pino from "pino";

import { env, isDevelopment, isTest } from "./env.js";

export const logger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL,
  ...(isDevelopment
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.refreshToken",
    ],
    censor: "[redacted]",
  },
});

export type Logger = typeof logger;
