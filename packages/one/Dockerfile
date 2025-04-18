FROM docker.io/library/base AS pruned

WORKDIR /app/packages/one
RUN mkdir -p /app/one/pruned && pnpm --filter one deploy --prod /app/one/pruned

# Final production image
FROM node:22-alpine

WORKDIR /app

COPY --from=pruned /app/one/pruned/dist dist
COPY --from=pruned /app/one/pruned/node_modules node_modules

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV TZ='Europe/Warsaw'
EXPOSE 4000

# Run the application
CMD ["node", "/app/packages/one/dist/server.js"]
