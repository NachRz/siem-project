#!/bin/bash
# Script de monitorización de puertos abiertos
# Escribe la lista de puertos TCP/UDP en escucha en un log
# para que Filebeat lo envíe a Elasticsearch

LOG_FILE="/var/log/siem-ports.log"

# Obtenemos los puertos en escucha con formato: puerto/protocolo/proceso
# ss -tuln muestra solo puertos escuchando, sin resolver nombres
# awk extrae puerto/protocolo para identificar cambios únicos

PUERTOS=$(ss -tuln | awk 'NR>1 {
    # Extraemos protocolo (tcp/udp) y dirección local
    split($5, addr, ":")
    puerto = addr[length(addr)]
    printf "%s/%s ", puerto, $1
}' | tr ' ' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')

# Timestamp ISO para que Filebeat lo parsee bien
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Escribimos la línea con etiqueta SIEM_PORTS para filtrarla luego
echo "$TIMESTAMP SIEM_PORTS hostname=$(hostname) puertos=$PUERTOS" >> $LOG_FILE

