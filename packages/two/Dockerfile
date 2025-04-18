FROM docker.io/library/base AS pruned

WORKDIR /app/packages/two
RUN mkdir -p /app/two/pruned && pnpm --filter two deploy --prod /app/two/pruned

# Final production image
FROM node:22-alpine

WORKDIR /app

COPY --from=pruned /app/two/pruned/dist dist
COPY --from=pruned /app/two/pruned/node_modules node_modules

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV TZ='Europe/Warsaw'
EXPOSE 4001

# Run the application
CMD ["node", "/app/packages/two/dist/server.js"]
