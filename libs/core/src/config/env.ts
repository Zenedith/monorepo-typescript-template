export const config = {
    loggerMode: process.env.LOGGER_MODE || "console",
    elasticsearchNode: process.env.ELASTICSEARCH_HOSTS || "elasticsearch:9200",
    lokiNode: process.env.LOKI_HOST || "http://loki:8200",
};
