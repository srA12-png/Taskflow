FROM node:22-bookworm-slim AS client-build

WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm --prefix client ci
COPY client ./client
RUN npm --prefix client run build

FROM node:22-bookworm-slim AS server-build

WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/* \
    && npm_config_build_from_source=true npm --prefix server ci --omit=dev \
    && node -e "require('./server/node_modules/sqlite3')"

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./server/
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY server/src ./server/src
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 5000
CMD ["npm", "--prefix", "server", "start"]
