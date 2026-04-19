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

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Recolección de logs | Filebeat |
| Almacenamiento | Elasticsearch 8.x |
| Visualización base | Kibana |
| Detección de anomalías | Python 3 |
| Dashboard propio | React (en desarrollo) |
| Infraestructura | VirtualBox + Ubuntu Server 22.04 |

## Estructura del proyecto

    siem-project/
    ├── infrastructure/
    │   └── filebeat/
    │       └── filebeat.yml        # Configuración del agente de logs
    ├── detection/
    │   ├── rules/                  # Reglas de detección individuales
    │   └── engine.py               # Motor principal de detección
    ├── dashboard/                  # Frontend React (próximamente)
    └── docs/
        ├── architecture.md         # Arquitectura detallada del entorno
        └── setup.md                # Guía de instalación

## Reglas de detección implementadas

- [ ] Fuerza bruta SSH — más de 5 intentos fallidos en 1 minuto
- [ ] Login fuera de horario — acceso entre las 02:00 y las 06:00
- [ ] Escalada de privilegios — uso de sudo por usuario no habitual
- [ ] Puerto nuevo abierto — servicio nuevo detectado en la máquina objetivo

## Cómo reproducir el entorno

Ver `docs/setup.md` para instrucciones detalladas.

## Progreso

| Fase | Estado |
|---|---|
| Infraestructura VMs | ✅ Completado |
| Stack ELK | ✅ Completado |
| Filebeat | ✅ Completado |
| Reglas de detección Python | 🔄 En progreso |
| Dashboard React | ⏳ Pendiente |
| Migración Docker | ⏳ Pendiente |

## Autor

Nacho — Especialización en Ciberseguridad