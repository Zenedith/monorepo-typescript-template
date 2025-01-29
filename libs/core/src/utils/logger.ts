import pino from "pino";
import { ecsFormat } from "@elastic/ecs-pino-format";

let transport;

if (process.env.NODE_ENV === "production") {
  transport =
    {
      target: "pino-elasticsearch",
      options: {
        index: "project",
        node: "http://192.168.2.8:9200",
        esVersion: 8,
        flushBytes: 1000,
      },
    };
} else {
  transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

let config = {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  //DO NOT USE WITH ECS!
  // formatters: {
  //   level: (label: string) => {
  //     return { level: label.toUpperCase() };
  //   },
  // },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: transport,
};

if (process.env.NODE_ENV === "production") {
  config = {
    ...config,
    ...ecsFormat,
    // ...ecsFormat({ convertReqRes: true }),
  };
}


export const logger = pino(config);
