FROM node:22-bookworm-slim AS client-build

WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm --prefix client ci
COPY client ./client
RUN npm --prefix client run build

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json ./server/
RUN npm --prefix server ci --omit=dev
COPY server/src ./server/src
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 5000
CMD ["npm", "--prefix", "server", "start"]
