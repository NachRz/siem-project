# SIEM Casero — Proyecto Final Bastionado de Redes

Sistema de gestión de eventos de seguridad (SIEM) construido desde cero como proyecto final de la especialización en ciberseguridad.

## Objetivo

Detectar anomalías y ataques en tiempo real sobre una red virtualizada, combinando un stack ELK con reglas de detección propias en Python y un dashboard interactivo construido en React.

## Arquitectura

    siem-target (192.168.57.3)
        ├── Filebeat → envía logs
        └── siem-ports-monitor.sh → snapshots de puertos cada 30s
                    ↓
    siem-server (192.168.57.5)
        ├── Elasticsearch (puerto 9200)
        │   ├── Índice filebeat-*        (logs crudos del sistema)
        │   └── Índice alertas-siem      (alertas generadas por el motor)
        ├── Kibana (puerto 5601)
        ├── Logstash
        └── Motor de detección Python
                    ↓
            Dashboard React (localhost:5173)

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
| Infraestructura | VirtualBox + Ubuntu Server 22.04 |

## Estructura del proyecto

    siem-project/
    ├── infrastructure/
    │   ├── filebeat/
    │   │   └── filebeat.yml                   # Configuración del agente de logs
    │   └── ports-monitor/
    │       └── siem-ports-monitor.sh          # Script de snapshots de puertos
    ├── detection/
    │   ├── rules/                             # Reglas de detección individuales
    │   │   ├── brute_force.py                 # Fuerza bruta SSH agrupada por IP
    │   │   ├── login_exitoso.py               # Login exitoso desde IP no confiable
    │   │   ├── sudo.py                        # Ejecución de comandos sudo
    │   │   ├── horario_sospechoso.py          # Login fuera de horario
    │   │   ├── nuevo_usuario.py               # Nuevo usuario creado
    │   │   ├── archivos_criticos.py           # Modificación de ficheros sensibles
    │   │   └── puertos_nuevos.py              # Puerto nuevo abierto en el sistema
    │   └── engine.py                          # Motor principal que persiste alertas
    ├── dashboard/                             # Frontend React con Vite
    │   └── src/
    │       ├── components/
    │       │   ├── Header/                    # Cabecera con estado de conexión
    │       │   ├── StatsGrid/                 # Tarjetas de estadísticas en tiempo real
    │       │   ├── Timeline/                  # Gráfica temporal de actividad
    │       │   ├── AlertasList/               # Alertas generadas por el motor Python
    │       │   └── EventsList/                # Lista de eventos de seguridad
    │       ├── config/                        # Constantes del proyecto
    │       ├── services/                      # Capa de conexión con Elasticsearch
    │       ├── hooks/                         # Hooks personalizados de React
    │       ├── utils/                         # Deduplicación y clasificación de eventos
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
- [ ] Comandos sospechosos — netcat, wget de binarios, chmod +x
- [ ] Ráfaga de comandos sudo — posible script automatizado

## Sistema de alertas

Las alertas generadas por el motor de detección Python se persisten automáticamente en un índice dedicado de Elasticsearch (`alertas-siem`). El motor aplica deduplicación de eventos y persiste estado entre reinicios para evitar alertas duplicadas.

Características del motor:
- Deduplicación por PID del proceso para contrarrestar duplicados del log
- Persistencia de estado en disco entre reinicios
- Cooldown por IP en reglas de ráfaga para evitar alertas repetidas
- Cada regla es un módulo independiente fácil de extender
- Comparación contra línea base para reglas de detección de cambios

## Dashboard

Dashboard web construido en React que consume la API REST de Elasticsearch para mostrar eventos y alertas en tiempo real. Se actualiza automáticamente cada 10 segundos.

### Secciones del dashboard

- **Estadísticas en tiempo real** — contadores de los últimos 5 minutos (logins fallidos, exitosos, sudo)
- **Gráfica temporal** — actividad por minuto durante la última hora, separada por tipo de evento
- **Alertas de seguridad** — alertas procesadas por el motor de detección Python
- **Lista de eventos** — últimos eventos de seguridad del sistema con severidad visual
- **Indicador de conexión** — muestra el estado de la conexión con Elasticsearch

### Arquitectura frontend

- Componentes modulares con CSS Modules
- Hooks personalizados para separar lógica de datos de presentación
- Capa de servicios para centralizar las llamadas a Elasticsearch
- Utilidades de deduplicación en el cliente para eventos SSH duplicados
- Procesamiento y agregación de datos en el frontend para flexibilidad

## Monitorización de puertos

Script bash desplegado en `siem-target` que cada 30 segundos genera un snapshot de los puertos abiertos del sistema y lo escribe en `/var/log/siem-ports.log`. Filebeat recoge ese log y lo envía a Elasticsearch, donde la regla `puertos_nuevos.py` lo compara contra la línea base conocida para detectar aperturas sospechosas.

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

## Progreso

| Fase | Estado |
|---|---|
| Infraestructura VMs | ✅ Completado |
| Stack ELK | ✅ Completado |
| Filebeat | ✅ Completado |
| Reglas de detección Python | ✅ Completado |
| Persistencia de alertas en Elasticsearch | ✅ Completado |
| Dashboard React | ✅ Completado |
| Gráfica temporal con Chart.js | ✅ Completado |
| Deduplicación y ajuste fino de reglas | ✅ Completado |
| Monitorización de puertos | ✅ Completado |
| Reglas adicionales de detección | 🔄 En progreso |
| Estado de alertas y filtros | ⏳ Pendiente |
| Indicador de salud del sistema | ⏳ Pendiente |
| Autenticación en el dashboard | ⏳ Pendiente |
| Kali + script de ataque | ⏳ Pendiente |
| Exportación de informes PDF | ⏳ Pendiente |
| Migración Docker | ⏳ Pendiente |

## Autor

Nacho — Especialización en Ciberseguridad