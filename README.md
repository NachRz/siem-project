# SIEM Casero — Proyecto Final Bastionado de Redes

Sistema de gestión de eventos de seguridad (SIEM) construido desde cero como proyecto final de la especialización en ciberseguridad.

## Objetivo

Detectar anomalías y ataques en tiempo real sobre una red virtualizada, combinando un stack ELK con reglas de detección propias en Python y un dashboard construido en React.

## Arquitectura

    siem-target (192.168.57.3)
        └── Filebeat →
    siem-server (192.168.57.5)
        ├── Elasticsearch (puerto 9200)
        ├── Kibana (puerto 5601)
        ├── Logstash
        └── Motor de detección Python
                    ↓
            Dashboard React (localhost:5173)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Recolección de logs | Filebeat |
| Almacenamiento | Elasticsearch 8.x |
| Visualización base | Kibana |
| Detección de anomalías | Python 3 |
| Dashboard propio | React + Vite + Axios |
| Infraestructura | VirtualBox + Ubuntu Server 22.04 |

## Estructura del proyecto

    siem-project/
    ├── infrastructure/
    │   └── filebeat/
    │       └── filebeat.yml            # Configuración del agente de logs
    ├── detection/
    │   ├── rules/                      # Reglas de detección individuales
    │   │   ├── brute_force.py          # Fuerza bruta SSH
    │   │   ├── login_exitoso.py        # Login exitoso
    │   │   ├── sudo.py                 # Uso de sudo
    │   │   ├── horario_sospechoso.py   # Login fuera de horario
    │   │   └── nuevo_usuario.py        # Nuevo usuario creado
    │   └── engine.py                   # Motor principal de detección
    ├── dashboard/                      # Frontend React
    │   └── src/
    │       ├── components/
    │       │   ├── Header/             # Cabecera con estado de conexión
    │       │   ├── StatsGrid/          # Tarjetas de estadísticas
    │       │   └── EventsList/         # Lista de eventos en tiempo real
    │       ├── config/                 # Constantes del proyecto
    │       ├── services/               # Capa de conexión con Elasticsearch
    │       ├── hooks/                  # Hooks personalizados de React
    │       ├── utils/                  # Funciones auxiliares
    │       └── styles/                 # Estilos globales
    └── docs/
        ├── architecture.md             # Arquitectura detallada del entorno
        └── setup.md                    # Guía de instalación

## Reglas de detección implementadas

- [x] Fuerza bruta SSH — más de 5 intentos fallidos en 1 minuto
- [x] Login exitoso detectado
- [x] Uso de sudo detectado
- [x] Login fuera de horario — acceso entre las 02:00 y las 06:00
- [x] Nuevo usuario creado en el sistema
- [ ] Puerto nuevo abierto — servicio nuevo detectado en la máquina objetivo

## Dashboard

Dashboard web construido en React que consume la API REST de Elasticsearch para mostrar eventos en tiempo real. Se actualiza automáticamente cada 10 segundos y clasifica los eventos por severidad.

Características:
- Estadísticas globales de la última hora
- Lista de últimos 20 eventos con severidad visual
- Actualización automática en tiempo real
- Indicador de estado de conexión con Elasticsearch

## Cómo reproducir el entorno

Ver `docs/setup.md` para instrucciones detalladas.

## Progreso

| Fase | Estado |
|---|---|
| Infraestructura VMs | ✅ Completado |
| Stack ELK | ✅ Completado |
| Filebeat | ✅ Completado |
| Reglas de detección Python | ✅ Completado |
| Dashboard React | ✅ Completado |
| Migración Docker | ⏳ Pendiente |

## Autor

Nacho — Especialización en Ciberseguridad