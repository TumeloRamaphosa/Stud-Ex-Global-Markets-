FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

RUN npm ci

COPY . .

RUN npm run build


FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_PATH=/data/studex-content-hub.sqlite

COPY package.json package-lock.json ./
COPY server/package.json server/package.json

RUN npm ci --omit=dev --workspace server

COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/src/better-sqlite3.d.ts ./server/src/better-sqlite3.d.ts
COPY .env.example ./.env.example

RUN mkdir -p /data

EXPOSE 5000

CMD ["npm", "run", "start"]
