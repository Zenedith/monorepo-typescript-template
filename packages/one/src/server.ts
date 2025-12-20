import {logger} from "@project/core";
import {buildSchema} from "graphql";
import express from "express";
import {createHandler} from "graphql-http/lib/use/express";
import {ruruHTML} from "ruru/server";
import morgan from "morgan";
import {v4} from "uuid";
import {ExpressPrometheusMiddleware} from "@matteodisabatino/express-prometheus-middleware";

const prometheus = new ExpressPrometheusMiddleware();

const serverLogger = logger.child({logger: "server"});

const schemaStr = /* GraphQL */ `
  type Resource {
    id: ID
    name: String!
  }

  type Query {
    getResource(id: ID!): Resource
  }
`;
// Construct a schema, using GraphQL schema language
const schema = buildSchema(schemaStr);

// The root provides the top-level API endpoints
const root = {
    async getResource({id}: { id: string }) {
        logger.info(`Using ${id} to get resource`)
        return undefined;
    },
};

const app = express();

// Enable CORS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((req: any, res: any, next: any) => {
    res.setHeader("access-control-allow-credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Request ID middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((req: any, res: unknown, next) => {
    req.id = req.headers["x-request-id"] || v4();
    req.deviceId = req.headers["x-device-id"];
    req.appVersion = req.headers["x-app-version"];
    req.xForwardedHost = req.headers["x-forwarded-host"];
    next();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
morgan.token("id", (req: any) => req.id);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
morgan.token("xForwardedHost", (req: any) => req.xForwardedHost);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
morgan.token("deviceId", (req: any) => req.deviceId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
morgan.token("appVersion", (req: any) => req.appVersion);

app.use(prometheus.handler);
app.use(
    morgan((tokens, req, res) => {
        const entry = {
            date: tokens.date(req, res, "iso"),
            requestId: tokens.id(req, res),
            deviceId: tokens.deviceId(req, res),
            appVersion: tokens.appVersion(req, res),
            xForwardedHost: tokens.xForwardedHost(req, res),
            ip: tokens["remote-addr"](req, res),
            userAgent: tokens["user-agent"](req, res),
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: parseInt(tokens.status(req, res) || "500", 10),
            responseTime: tokens["response-time"](req, res),
        };
        const request = `${entry.date} ${entry.method} ${entry.url} ${entry.status} ${entry.userAgent} - ${entry.responseTime} ms`;
        serverLogger.info(entry, request);
        return request;
    }),
);

// Create and use the GraphQL handler.
app.all(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: root,
        context: (req) => {
            return {
                ip: req.raw.ip,
                requestId: req.headers["x-request-id" as keyof typeof req.headers] || v4(),
                deviceId: req.headers["x-device-id" as keyof typeof req.headers] ?? "",
                xForwardedHost: req.headers["x-forwarded-host" as keyof typeof req.headers] ?? "",
                appVersion: req.headers["x-app-version" as keyof typeof req.headers] ?? "",
                userAgent: req.headers["user-agent" as keyof typeof req.headers] ?? "",
            };
        },
    }),
);

// Serve the GraphiQL IDE.
app.get("/", (_req, res) => {
    res.type("html");
    res.end(ruruHTML({endpoint: "/graphql"}));
});

// Start the server at port
app.listen(4000);
serverLogger.info("Running a GraphQL API server at http://localhost:4000/graphql");
