import {logger} from "@project/core";
import {buildSchema} from "graphql";
import express from "express";
import {createHandler} from "graphql-http/lib/use/express";
// @ts-expect-error check it
import {ruruHTML} from "ruru/server";
import morgan from "morgan";
import uuid from "node-uuid";

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((req: any, res: unknown, next) => {
    req.id = uuid.v4();
    next();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
morgan.token("id", (req: any) => req.id);

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
        return `${entry.date}  ${entry.method} ${entry.url} ${entry.status} ${entry.userAgent} - ${entry.responseTime} ms`;
    }),
);

// Create and use the GraphQL handler.
app.all(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: root,
        context: req => ({
            ip: req.raw.ip,
        }),
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
