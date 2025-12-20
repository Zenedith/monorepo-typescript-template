FROM base:latest AS pruned

WORKDIR /app/packages/two

# Final production image
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pm2

COPY --from=pruned /app/two/dist/build.js /app/build.js

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV TZ='Europe/Warsaw'
EXPOSE 4001

# Run the application
CMD ["pm2-runtime", "/app/build.js"]
