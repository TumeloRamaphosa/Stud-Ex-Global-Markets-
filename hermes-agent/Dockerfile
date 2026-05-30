# Hermes Agent — Content Creation Container
# Runs NousResearch Hermes Agent for content generation
# Connects to: Ollama (local models), Cloud APIs, Slack, Discord
# Works alongside CashClaw (store ops agent)
#
# Build: docker build -t studex-hermes .
# Run:   docker run -p 3004:3004 --env-file .env studex-hermes

FROM node:20-alpine AS base
RUN apk add --no-cache curl bash

WORKDIR /app

# Install Hermes Agent CLI
RUN curl -fsSL https://hermes-agent.nousresearch.com/install.sh -o /tmp/install-hermes.sh || true

# Core server
COPY package.json ./
RUN npm install --production
COPY src/ ./src/

EXPOSE 3004
ENV PORT=3004

CMD ["node", "src/index.js"]
