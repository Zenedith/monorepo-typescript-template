import {logger} from "@project/core";
import express from "express";
import morgan from "morgan";
import {ExpressPrometheusMiddleware} from "@matteodisabatino/express-prometheus-middleware";
import {v4} from "uuid";

const prometheus = new ExpressPrometheusMiddleware();

const serverLogger = logger.child({logger: "server"});
const port = 4001;
const app = express();
app.use(prometheus.handler);


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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get("/resources/:id", async (req: any, res) => {
    const id = req.params.id;
    const requestId = req["id"] || "";
    logger.info(`Using ${id} and ${requestId} to get resource`)
    const resource: string | undefined = undefined;
    res.type("application/json");
    res.end(JSON.stringify(resource));
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get("/resources", async (req: any, res) => {
    const requestId = req.id;
    logger.info(`Using ${requestId} to get resource`)
    const resources: string[] = [];
    res.type("application/json");
    res.end(JSON.stringify({resources}));
});

app.listen(port);
serverLogger.info(`Running server two at http://localhost:${port}`);
