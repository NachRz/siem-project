# Dockerfile del dashboard React
# Construcción multi-stage: build con Node, servir con Nginx

# ═══════════════════════════════════════════════════
# Stage 1: Build del dashboard con Vite
# ═══════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los ficheros de dependencias primero para aprovechar la caché
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci

# Copiamos el código fuente y generamos el build de producción
COPY dashboard/ .
RUN npm run build

# ═══════════════════════════════════════════════════
# Stage 2: Servir con Nginx (imagen final más ligera)
# ═══════════════════════════════════════════════════
FROM nginx:alpine

# Copiamos la configuración personalizada de Nginx
COPY docker/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los ficheros estáticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx escucha en el puerto 80 dentro del contenedor
EXPOSE 80

# Arrancamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]