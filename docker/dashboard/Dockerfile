# Dockerfile del dashboard React
# Construcción multi-stage: build con Node, servir con Nginx
# Acepta VITE_ES_URL como argumento para configurar la URL de Elasticsearch

# ═══════════════════════════════════════════════════
# Stage 1: Build del dashboard con Vite
# ═══════════════════════════════════════════════════
FROM node:20-alpine AS builder

# Argumento que se recibe desde docker-compose.yml
# Vite requiere que la URL esté disponible en tiempo de build
ARG VITE_ES_URL=http://localhost:9200
ENV VITE_ES_URL=$VITE_ES_URL

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