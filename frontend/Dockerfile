FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/index.html /app/
RUN npm ci

COPY frontend /app

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
