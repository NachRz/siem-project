# SIEM Casero — Proyecto Final Bastionado de Redes

Sistema de gestión de eventos de seguridad (SIEM) construido desde cero como proyecto final de la especialización en ciberseguridad. Detecta anomalías y ataques en tiempo real sobre una red virtualizada, combinando un stack ELK con reglas de detección propias en Python, un dashboard interactivo en React con gestión de alertas, exportación de informes PDF y una máquina atacante Kali Linux para la validación en vivo del sistema.

## Arquitectura

    siem-attacker (Kali Linux)
        └── Scripts de ataque → nmap, hydra, ssh fallidos
                    ↓ (red interna siem-net)
    siem-target (192.168.57.3)
        ├── Filebeat → envía logs
        └── siem-ports-monitor.sh → snapshots de puertos cada 30s
                    ↓
    Máquina host (Docker Compose)
        ├── Elasticsearch (puerto 9200)
        │   ├── Índice filebeat-*        (logs crudos del sistema)
        │   ├── Índice alertas-siem      (alertas generadas por el motor)
        │   └── Índice motor-heartbeat   (heartbeat del motor Python)
        ├── Kibana (puerto 5601)
        ├── Motor de detección Python
        └── Dashboard React (puerto 5173)
                    ↓
            Informes PDF descargables

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Recolección de logs | Filebeat |
| Monitorización de puertos | Script bash + cron |
| Almacenamiento | Elasticsearch 8.19 |
| Visualización base | Kibana 8.19 |
| Detección de anomalías | Python 3.12 |
| Dashboard propio | React + Vite + Axios |
| Gráficas interactivas | Chart.js + react-chartjs-2 |
| Exportación de informes | jsPDF + jspdf-autotable |
| Orquestación | Docker Compose |
| Infraestructura | VirtualBox + Ubuntu Server 22.04 |
| Máquina atacante | Kali Linux + nmap + hydra + sshpass |

## Instalación rápida

El proyecto incluye un script `setup.sh` que automatiza todo el despliegue del stack en la máquina host. Solo necesitas tener Docker instalado y ajustar las IPs a tu entorno.

### Despliegue en 3 comandos

    git clone https://github.com/NachRz/siem-project.git
    cd siem-project
    ./setup.sh

El script se encarga de:

1. Crear el fichero `.env` a partir de `.env.example` si no existe
2. Generar el fichero de configuración de Filebeat con la IP correcta del host
3. Construir las imágenes Docker y arrancar los contenedores
4. Mostrar un resumen con las URLs de acceso

Al terminar tendrás disponibles:

- Elasticsearch en `http://localhost:9200`
- Kibana en `http://localhost:5601`
- Dashboard en `http://localhost:5173`

### Configuración personalizada

Las IPs, puertos y rutas están definidos en el fichero `.env` de la raíz del proyecto. Para adaptarlo a tu entorno copia `.env.example` a `.env` y ajusta los valores antes de lanzar `./setup.sh`:

    cp .env.example .env
    nano .env

Variables disponibles:

| Variable | Descripción | Por defecto |
|---|---|---|
| `SIEM_HOST_IP` | IP de la máquina host (donde corre Docker) | `192.168.57.1` |
| `SIEM_TARGET_IP` | IP de la VM monitorizada | `192.168.57.3` |
| `SIEM_ATTACKER_IP` | IP de la VM atacante Kali | `192.168.57.4` |
| `VITE_ES_URL` | URL de Elasticsearch para el navegador | `http://localhost:9200` |
| `ELASTICSEARCH_URL` | URL interna de Elasticsearch (Docker) | `http://elasticsearch:9200` |
| `ELASTICSEARCH_PORT` | Puerto expuesto de Elasticsearch | `9200` |
| `KIBANA_PORT` | Puerto expuesto de Kibana | `5601` |
| `DASHBOARD_PORT` | Puerto expuesto del dashboard | `5173` |

## Instalación completa en un entorno nuevo

Esta guía cubre el despliegue completo desde cero, incluyendo las máquinas virtuales.

### Requisitos previos

En la máquina host (donde correrá Docker):
- Sistema operativo Linux (recomendado: Debian 12 o Ubuntu 22.04)
- 8 GB de RAM mínimo (16 GB recomendado)
- 20 GB de disco libre
- Docker y Docker Compose instalados
- VirtualBox 7.x instalado

### Paso 1 — Clonar el repositorio

    git clone https://github.com/NachRz/siem-project.git
    cd siem-project

### Paso 2 — Instalar Docker (si no está instalado)

    sudo apt update
    sudo apt install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    newgrp docker

### Paso 3 — Configurar la red interna de VirtualBox

En VirtualBox, crea un adaptador de red host-only:

1. Archivo → Administrador de red de host
2. Crear nuevo adaptador con estas propiedades:
   - Nombre: `vboxnet1`
   - IPv4: valor de `SIEM_HOST_IP` del `.env`
   - Máscara: `255.255.255.0`
   - DHCP desactivado

### Paso 4 — Crear y configurar la VM siem-target

Crea una nueva VM en VirtualBox con estas características:
- Nombre: `siem-target`
- Sistema: Ubuntu Server 22.04 LTS (64 bits)
- RAM: 2048 MB
- Disco: 10 GB
- Red: adaptador 1 en NAT, adaptador 2 en red host-only

Durante la instalación de Ubuntu:
- Usuario: `siem-target`
- Idioma del sistema: English (importante para que los patrones de detección coincidan)
- Instalar OpenSSH server

Una vez instalado, configura la IP estática editando `/etc/netplan/00-installer-config.yaml`:

    network:
      version: 2
      ethernets:
        enp0s3:
          dhcp4: true
        enp0s8:
          dhcp4: false
          addresses:
            - 192.168.57.3/24

Aplica los cambios:

    sudo netplan apply

Instala Filebeat:

    curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.19.0-amd64.deb
    sudo dpkg -i filebeat-8.19.0-amd64.deb

Desde la máquina host, ejecuta `./setup.sh` para generar el fichero de configuración de Filebeat con la IP correcta:

    ./setup.sh

Copia el fichero generado a `siem-target`:

    scp infrastructure/filebeat/filebeat.yml.generated siem-target@192.168.57.3:/tmp/filebeat.yml

En siem-target:

    sudo mv /tmp/filebeat.yml /etc/filebeat/filebeat.yml
    sudo systemctl restart filebeat

Instala el script de monitorización de puertos:

    sudo cp infrastructure/ports-monitor/siem-ports-monitor.sh /usr/local/bin/
    sudo chmod +x /usr/local/bin/siem-ports-monitor.sh

Crea el cron para ejecutarlo cada 30 segundos en `/etc/cron.d/siem-ports-monitor`:

    * * * * * root /usr/local/bin/siem-ports-monitor.sh
    * * * * * root sleep 30 && /usr/local/bin/siem-ports-monitor.sh

Arranca los servicios:

    sudo systemctl enable --now filebeat
    sudo systemctl enable --now cron

### Paso 5 — Crear y configurar la VM siem-attacker (Kali Linux)

Crea una VM Kali Linux con adaptador de red host-only. Una vez arrancada:

    mkdir -p ~/siem-attack
    # Copiar el script de ataque del repositorio a ~/siem-attack/attack-demo.sh
    chmod +x ~/siem-attack/attack-demo.sh

Asegúrate de tener instaladas las herramientas necesarias:

    sudo apt install -y nmap hydra sshpass

### Paso 6 — Arrancar el SIEM

En la máquina host, desde la raíz del proyecto:

    ./setup.sh

Este comando hace todo el despliegue: lee el `.env`, genera la configuración de Filebeat y arranca los contenedores.

### Paso 7 — Acceder al dashboard

Abre en el navegador:

    http://localhost:5173

Deberías ver el dashboard con:
- Panel de salud con Elasticsearch, Filebeat y motor Python en verde
- Estadísticas en tiempo real
- Gráfica de actividad
- Lista de alertas y eventos

### Paso 8 — Lanzar la demo de ataques

Desde la VM Kali:

    cd ~/siem-attack
    ./attack-demo.sh

Verás cómo aparecen las alertas en tiempo real en el dashboard.

## Comandos útiles de Docker

Ver el estado de los contenedores:

    docker ps

Ver los logs de un servicio concreto:

    docker logs siem-elasticsearch --tail 50
    docker logs siem-kibana --tail 50
    docker logs siem-detection-engine --tail 50
    docker logs siem-dashboard --tail 50

Parar todo el stack:

    docker compose -f docker/docker-compose.yml down

Reiniciar un servicio concreto:

    docker compose -f docker/docker-compose.yml up -d --force-recreate detection-engine

Limpiar todos los datos y empezar de cero (cuidado, borra los índices):

    docker compose -f docker/docker-compose.yml down -v
    ./setup.sh

## Reglas de detección implementadas

- [x] Fuerza bruta SSH — agrupación por IP con deduplicación por PID
- [x] Login exitoso desde IP fuera de la red de confianza
- [x] Ejecución de comandos sudo — alerta por cada comando con usuario y comando
- [x] Login fuera de horario — acceso entre las 02:00 y las 06:00
- [x] Nuevo usuario creado en el sistema
- [x] Modificación de archivos críticos — /etc/passwd, /etc/shadow, /etc/sudoers, etc.
- [x] Puerto nuevo abierto — detección mediante snapshots periódicos
- [x] Comandos sospechosos — netcat, wget de binarios, chmod +x, base64 -d, /dev/tcp
- [x] Ráfaga de comandos sudo — posible script automatizado

## Sistema de alertas

Las alertas se persisten en el índice `alertas-siem` con un campo de estado gestionable desde el dashboard.

### Estados de las alertas

- **Nueva** — alerta recién generada sin revisar
- **Investigando** — un analista está revisando la alerta
- **Resuelta** — incidente gestionado y cerrado
- **Falso positivo** — alerta que no corresponde a un incidente real

### Características del motor

- Deduplicación por PID del proceso para contrarrestar duplicados del log
- Persistencia de estado en disco entre reinicios
- Cooldown por IP en reglas de ráfaga para evitar alertas repetidas
- Cada regla es un módulo independiente fácil de extender
- Heartbeat periódico para monitorización de su propio estado
- Timestamps en UTC consistentes con Elasticsearch
- Lee la URL de Elasticsearch de variable de entorno (Docker-ready)

## Dashboard

Dashboard web construido en React que consume la API REST de Elasticsearch para mostrar eventos y alertas en tiempo real. Se actualiza automáticamente cada 10 segundos.

### Secciones del dashboard

- **Panel de salud** — estado de Elasticsearch, Filebeat y motor Python con indicadores en vivo
- **Estadísticas en tiempo real** — contadores de los últimos 5 minutos
- **Gráfica temporal** — actividad por minuto durante la última hora
- **Filtros avanzados** — búsqueda por texto, filtro por severidad y filtro por estado
- **Alertas de seguridad** — alertas procesadas con gestión de estados
- **Lista de eventos** — últimos eventos de seguridad del sistema
- **Exportación PDF** — genera informes profesionales con las alertas filtradas

## Informes PDF

El dashboard permite exportar un informe profesional en PDF con las alertas actualmente filtradas. El informe incluye cabecera corporativa con fecha y hora de generación, resumen ejecutivo con estadísticas por severidad y estado, tabla detallada de alertas con código de color por severidad y numeración automática de páginas. Todo se genera en el navegador sin necesidad de backend adicional.

## Monitorización de puertos

Script bash desplegado en `siem-target` que cada 30 segundos genera un snapshot de los puertos abiertos del sistema y lo escribe en `/var/log/siem-ports.log`. Filebeat recoge ese log y lo envía a Elasticsearch, donde la regla `puertos_nuevos.py` lo compara contra la línea base conocida para detectar aperturas sospechosas.

## Demo de ataques con Kali Linux

La máquina Kali Linux (`siem-attacker`) ejecuta el script `attack-demo.sh` para lanzar una secuencia de ataques encadenados:

1. **Escaneo de puertos** con nmap
2. **Fuerza bruta SSH** con hydra y diccionario de contraseñas comunes
3. **Intentos directos de SSH** con sshpass y credenciales inválidas
4. **Simulación de descarga de binario sospechoso** (post-explotación)
5. **Apertura de puerto sospechoso** para exfiltración

Cada ataque dispara alertas concretas en el dashboard, demostrando la efectividad de las reglas de detección en tiempo real.

## Progreso

| Fase | Estado |
|---|---|
| Infraestructura VMs | ✅ Completado |
| Stack ELK | ✅ Completado |
| Filebeat | ✅ Completado |
| Reglas de detección Python (9 reglas) | ✅ Completado |
| Persistencia de alertas en Elasticsearch | ✅ Completado |
| Dashboard React | ✅ Completado |
| Gráfica temporal con Chart.js | ✅ Completado |
| Deduplicación y ajuste fino de reglas | ✅ Completado |
| Monitorización de puertos | ✅ Completado |
| Gestión de estado de alertas | ✅ Completado |
| Filtros avanzados en el dashboard | ✅ Completado |
| Indicador de salud del sistema | ✅ Completado |
| Kali + script de ataque | ✅ Completado |
| Exportación de informes PDF | ✅ Completado |
| Migración Docker | ✅ Completado |
| Configuración parametrizada con .env | ✅ Completado |

## Autor

Nacho — Especialización en Ciberseguridad