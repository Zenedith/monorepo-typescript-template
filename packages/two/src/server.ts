import {logger} from "@project/core";
import express from "express";
import morgan from "morgan";
import uuid from "node-uuid";

const serverLogger = logger.child({logger: "server"});
const port = 4001;
const app = express();

app.use((req: any, res: any, next) => { // eslint-disable-line
    req.id = uuid.v4();
    next();
});

morgan.token("id", (req: any) => req.id); // eslint-disable-line

app.use(
    morgan((tokens, req, res) => {
        const entry = {
            date: tokens.date(req, res, "iso"),
            requestId: tokens.id(req, res),
            ip: tokens["remote-addr"](req, res),
            userAgent: tokens["user-agent"](req, res),
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: parseInt(tokens.status(req, res) || "500", 10),
            responseTime: tokens["response-time"](req, res),
        };
        serverLogger.info(entry, "HTTP request");
        return `${entry.date} ${entry.method} ${entry.url} ${entry.status} ${entry.userAgent} - ${entry.responseTime} ms`;
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
