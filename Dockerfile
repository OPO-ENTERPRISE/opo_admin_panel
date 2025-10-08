# Build stage: compila la app Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Configuración para CI y evitar prompts
ENV NG_CLI_ANALYTICS=ci

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el resto del código y construye
COPY . .
RUN npm run build

# Runtime stage: sirve estáticos respetando $PORT (Cloud Run)
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Instala un servidor estático ligero
RUN npm i -g serve@14

# Copia los artefactos construidos
# Angular genera dist/<app-name>/browser por defecto
COPY --from=builder /app/dist/admin-panel/browser /app/dist

# Corre como usuario no root (Cloud Run recomendado)
USER node

# Cloud Run usa $PORT; exponemos 8080 por convención local
EXPOSE 8080

# Inicia el servidor estático enlazado al $PORT
CMD ["sh", "-c", "serve -s -l ${PORT:-8080} /app/dist"]
