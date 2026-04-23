# SIEM Casero — Proyecto Final Bastionado de Redes

Sistema de gestión de eventos de seguridad (SIEM) construido desde cero como proyecto final de la especialización en ciberseguridad.

## Objetivo

Detectar anomalías y ataques en tiempo real sobre una red virtualizada, combinando un stack ELK con reglas de detección propias en Python, un dashboard interactivo construido en React con gestión de alertas y filtros avanzados, exportación de informes PDF y una máquina atacante Kali Linux para la validación en vivo del sistema.

## Arquitectura

    siem-attacker (Kali Linux)
        └── Scripts de ataque → nmap, hydra, ssh fallidos
                    ↓ (red interna siem-net)
    siem-target (192.168.57.3)
        ├── Filebeat → envía logs
        └── siem-ports-monitor.sh → snapshots de puertos cada 30s
                    ↓
    siem-server (192.168.57.5)
        ├── Elasticsearch (puerto 9200)
        │   ├── Índice filebeat-*        (logs crudos del sistema)
        │   ├── Índice alertas-siem      (alertas generadas por el motor)
        │   └── Índice motor-heartbeat   (heartbeat del motor Python)
        ├── Kibana (puerto 5601)
        ├── Logstash
        └── Motor de detección Python
                    ↓
            Dashboard React (localhost:5173)
                    ↓
            Informes PDF descargables

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Recolección de logs | Filebeat |
| Monitorización de puertos | Script bash + cron |
| Almacenamiento | Elasticsearch 8.x |
| Visualización base | Kibana |
| Detección de anomalías | Python 3 |
| Dashboard propio | React + Vite + Axios |
| Gráficas interactivas | Chart.js + react-chartjs-2 |
| Exportación de informes | jsPDF + jspdf-autotable |
| Infraestructura | VirtualBox + Ubuntu Server 22.04 |
| Máquina atacante | Kali Linux + nmap + hydra + sshpass |

## Estructura del proyecto

    siem-project/
    ├── infrastructure/
    │   ├── filebeat/
    │   │   └── filebeat.yml                   # Configuración del agente de logs
    │   ├── ports-monitor/
    │   │   └── siem-ports-monitor.sh          # Script de snapshots de puertos
    │   └── attack-demo/
    │       └── attack-demo.sh                 # Script de demo de ataques desde Kali
    ├── detection/
    │   ├── rules/                             # Reglas de detección individuales
    │   │   ├── brute_force.py                 # Fuerza bruta SSH agrupada por IP
    │   │   ├── login_exitoso.py               # Login exitoso desde IP no confiable
    │   │   ├── sudo.py                        # Ejecución de comandos sudo
    │   │   ├── horario_sospechoso.py          # Login fuera de horario
    │   │   ├── nuevo_usuario.py               # Nuevo usuario creado
    │   │   ├── archivos_criticos.py           # Modificación de ficheros sensibles
    │   │   ├── puertos_nuevos.py              # Puerto nuevo abierto
    │   │   ├── comandos_sospechosos.py        # Patrones típicos de atacante
    │   │   └── rafaga_sudo.py                 # Ráfaga de sudos (script automatizado)
    │   └── engine.py                          # Motor que persiste alertas con estado
    ├── dashboard/                             # Frontend React con Vite
    │   └── src/
    │       ├── components/
    │       │   ├── Header/                    # Cabecera con estado de conexión
    │       │   ├── HealthStatus/              # Indicador de salud del sistema
    │       │   ├── StatsGrid/                 # Tarjetas de estadísticas en tiempo real
    │       │   ├── Timeline/                  # Gráfica temporal de actividad
    │       │   ├── AlertasFilters/            # Filtros + exportación PDF
    │       │   ├── AlertasList/               # Alertas con gestión de estado
    │       │   └── EventsList/                # Lista de eventos de seguridad
    │       ├── config/                        # Constantes del proyecto
    │       ├── services/                      # Capa de conexión con Elasticsearch
    │       ├── hooks/                         # Hooks personalizados de React
    │       ├── utils/
    │       │   ├── severity.js                # Clasificación y stats de eventos
    │       │   ├── timeline.js                # Procesamiento de timeline
    │       │   └── pdfExport.js               # Generación de informes PDF
    │       └── styles/                        # Estilos globales
    └── docs/
        ├── architecture.md                    # Arquitectura detallada del entorno
        └── setup.md                           # Guía de instalación

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

Las alertas generadas por el motor de detección Python se persisten automáticamente en un índice dedicado de Elasticsearch (`alertas-siem`) con un campo de estado gestionable desde el dashboard.

### Estados de las alertas

Cada alerta puede tener uno de estos estados:

- **Nueva** — alerta recién generada sin revisar
- **Investigando** — un analista está revisando la alerta
- **Resuelta** — incidente gestionado y cerrado
- **Falso positivo** — alerta que no corresponde a un incidente real

El estado se puede cambiar desde el propio dashboard haciendo clic en el badge de la alerta.

### Características del motor

- Deduplicación por PID del proceso para contrarrestar duplicados del log
- Persistencia de estado en disco entre reinicios
- Cooldown por IP en reglas de ráfaga para evitar alertas repetidas
- Cada regla es un módulo independiente fácil de extender
- Comparación contra línea base para reglas de detección de cambios
- Heartbeat periódico para monitorización de su propio estado
- Timestamps en UTC consistentes con Elasticsearch

## Dashboard

Dashboard web construido en React que consume la API REST de Elasticsearch para mostrar eventos y alertas en tiempo real. Se actualiza automáticamente cada 10 segundos.

### Secciones del dashboard

- **Panel de salud** — estado de Elasticsearch, Filebeat y motor Python con indicadores en vivo
- **Estadísticas en tiempo real** — contadores de los últimos 5 minutos
- **Gráfica temporal** — actividad por minuto durante la última hora, separada por tipo de evento
- **Filtros avanzados** — búsqueda por texto, filtro por severidad y filtro por estado
- **Alertas de seguridad** — alertas procesadas con gestión de estados
- **Lista de eventos** — últimos eventos de seguridad del sistema con severidad visual
- **Exportación PDF** — genera informes profesionales con las alertas filtradas

### Filtros disponibles

- **Búsqueda de texto** — filtra por cualquier palabra en el mensaje o tipo de alerta
- **Severidad** — filtra por nivel: Alta, Media, Baja o todas
- **Estado** — filtra por estado: Nueva, Investigando, Resuelta, Falso positivo o todos

### Arquitectura frontend

- Componentes modulares con CSS Modules
- Hooks personalizados para separar lógica de datos de presentación
- Capa de servicios para centralizar las llamadas a Elasticsearch
- Filtrado reactivo en cliente con `useMemo` para optimizar re-renders
- Actualización optimista de la UI al cambiar estados de alertas
- Utilidades de deduplicación en el cliente para eventos SSH duplicados
- Generación de informes PDF directamente desde el navegador

## Informes PDF

El dashboard permite exportar un informe profesional en PDF con las alertas actualmente filtradas. El informe incluye:

- Cabecera corporativa con fecha y hora de generación
- Resumen ejecutivo con estadísticas por severidad y estado
- Tabla detallada de alertas con código de color por severidad
- Numeración automática de páginas

Todo el proceso se genera en el navegador sin necesidad de backend adicional, usando jsPDF y jspdf-autotable.

## Monitorización de puertos

Script bash desplegado en `siem-target` que cada 30 segundos genera un snapshot de los puertos abiertos del sistema y lo escribe en `/var/log/siem-ports.log`. Filebeat recoge ese log y lo envía a Elasticsearch, donde la regla `puertos_nuevos.py` lo compara contra la línea base conocida para detectar aperturas sospechosas.

## Demo de ataques con Kali Linux

El proyecto incluye una máquina Kali Linux (`siem-attacker`) preparada para ejecutar ataques en vivo contra `siem-target`. El script `attack-demo.sh` lanza una secuencia de ataques encadenados para demostrar las capacidades de detección del SIEM:

1. **Escaneo de puertos** con nmap
2. **Fuerza bruta SSH** con hydra y diccionario de contraseñas comunes
3. **Intentos directos de SSH** con sshpass y credenciales inválidas
4. **Simulación de descarga de binario sospechoso** (post-explotación)
5. **Apertura de puerto sospechoso** para exfiltración

Cada ataque dispara alertas concretas en el dashboard, demostrando la efectividad de las reglas de detección en tiempo real.

## Cómo reproducir el entorno

Ver `docs/setup.md` para instrucciones detalladas.

### Arrancar el proyecto

    # Servidor SIEM
    ssh siem-server@192.168.57.5
    sudo systemctl start elasticsearch kibana

    # Motor de detección
    cd siem-project
    source venv/bin/activate
    python3 detection/engine.py

    # Dashboard
    cd dashboard
    npm run dev

### Lanzar la demo de ataques

    # Desde Kali Linux
    cd ~/siem-attack
    ./attack-demo.sh

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
| Migración Docker | ⏳ Pendiente |

## Autor

Nacho — Especialización en Ciberseguridad