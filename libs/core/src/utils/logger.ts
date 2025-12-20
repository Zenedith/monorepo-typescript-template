import pino from "pino";
import { pinoLoki } from "pino-loki";
import { ecsFormat } from "@elastic/ecs-pino-format";
import pinoElastic from "pino-elasticsearch";
import os from "os";
import pretty from "pino-pretty";

import { config } from "../config/env";

const DC = process.env.DC || "local";
const LOGGER_MIN_LEVEL = process.env.LOGGER_MIN_LEVEL || "info";

const loggerConfig = {
  level: LOGGER_MIN_LEVEL,
  //DO NOT USE WITH ECS!
  // formatters: {
  //   level: (label: string) => {
  //     return { level: label.toUpperCase() };
  //   },
  // },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const logger = config.loggerMode === "elasticsearch"
    ? pino(
        {
          ...loggerConfig,
          ...ecsFormat,
        },
        pinoElastic(
            {
              index: "project",
              node: config.elasticsearchNode,
              esVersion: 8,
              flushBytes: 1000,
            },
        ))
    : config.loggerMode === "loki" ? pino(pinoLoki({
          batching: true,
          interval: 60,
          host: config.lokiNode,
          labels: { app: "project", hostname: os.hostname(), dc: DC },
        }))
        : pino({
              ...loggerConfig,
            },
            pretty({
              colorize: process.env.NODE_ENV !== "production",
            }),
        );

export { logger };