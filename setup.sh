#!/bin/bash
# Script de setup del SIEM
# Lee las variables del .env, genera los ficheros de configuración
# y arranca todo el stack con Docker Compose

set -e  # Abortar si algún comando falla

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       SIEM SETUP — Despliegue            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════
# 1. Comprobar que existe el .env
# ═══════════════════════════════════════════════════════════
if [ ! -f .env ]; then
    echo -e "${YELLOW}[AVISO] No existe el fichero .env${NC}"
    echo -e "${YELLOW}Se creará a partir de .env.example con los valores por defecto${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Fichero .env creado${NC}"
    echo -e "${YELLOW}  Puedes editarlo para personalizar las IPs y arrancar de nuevo${NC}"
    echo ""
fi

# ═══════════════════════════════════════════════════════════
# 2. Cargar las variables del .env
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[1/4] Cargando configuración del .env...${NC}"
set -a
source .env
set +a

echo -e "${GREEN}  ✓ SIEM_HOST_IP       = ${SIEM_HOST_IP}${NC}"
echo -e "${GREEN}  ✓ SIEM_TARGET_IP     = ${SIEM_TARGET_IP}${NC}"
echo -e "${GREEN}  ✓ SIEM_ATTACKER_IP   = ${SIEM_ATTACKER_IP}${NC}"
echo ""

# ═══════════════════════════════════════════════════════════
# 3. Generar el fichero filebeat.yml a partir de la plantilla
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[2/4] Generando configuración de Filebeat...${NC}"

TEMPLATE="infrastructure/filebeat/filebeat.yml.template"
OUTPUT="infrastructure/filebeat/filebeat.yml.generated"

if [ ! -f "$TEMPLATE" ]; then
    echo -e "${RED}  ✗ No se encuentra la plantilla: $TEMPLATE${NC}"
    exit 1
fi

# Sustituimos la variable {{SIEM_HOST_IP}} por la IP real
sed "s|{{SIEM_HOST_IP}}|${SIEM_HOST_IP}|g" "$TEMPLATE" > "$OUTPUT"
echo -e "${GREEN}  ✓ Fichero generado: $OUTPUT${NC}"
echo -e "${YELLOW}  → Copia este fichero a siem-target: /etc/filebeat/filebeat.yml${NC}"
echo ""

# ═══════════════════════════════════════════════════════════
# 4. Arrancar Docker Compose
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[3/4] Arrancando el stack con Docker Compose...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}  ✗ Docker no está instalado${NC}"
    echo -e "${YELLOW}  Instala Docker siguiendo la guía del README${NC}"
    exit 1
fi

# Ejecutamos docker compose desde la carpeta docker/
# Pero le indicamos que use el .env de la raíz con --env-file
docker compose --env-file .env -f docker/docker-compose.yml up -d

echo ""

# ═══════════════════════════════════════════════════════════
# 5. Resumen final
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[4/4] Despliegue completado${NC}"
echo ""
echo -e "${GREEN}Servicios disponibles:${NC}"
echo -e "  ${GREEN}✓${NC} Elasticsearch: http://localhost:${ELASTICSEARCH_PORT:-9200}"
echo -e "  ${GREEN}✓${NC} Kibana:        http://localhost:${KIBANA_PORT:-5601}"
echo -e "  ${GREEN}✓${NC} Dashboard:     http://localhost:${DASHBOARD_PORT:-5173}"
echo ""
echo -e "${YELLOW}Siguientes pasos:${NC}"
echo -e "  1. Copia ${OUTPUT} a siem-target:/etc/filebeat/filebeat.yml"
echo -e "  2. Reinicia Filebeat en siem-target: sudo systemctl restart filebeat"
echo -e "  3. Espera 1-2 minutos a que Kibana termine de arrancar"
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           SIEM LISTO                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

