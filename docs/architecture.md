# Arquitectura del entorno

## VMs

| VM | Hostname | IP | Rol |
|---|---|---|---|
| siem-server | ServerProyecto | 192.168.57.5 | Servidor ELK + SIEM |
| siem-target | UbuntuProyecto | 192.168.57.3 | Máquina objetivo |

## Red interna
- Nombre: siem-net
- Rango: 192.168.57.0/24

## Acceso SSH
ssh siem@192.168.57.5   ← servidor SIEM
ssh siem@192.168.57.3   ← máquina objetivo

## Stack ELK

| Componente | Versión | Estado |
|---|---|---|
| Elasticsearch | 8.19.14 | Instalado y funcionando |
| Kibana | 8.x | Instalado y funcionando |
| Logstash | 8.x | Instalado |

### Configuración aplicada en Elasticsearch
- Archivo: `/etc/elasticsearch/elasticsearch.yml`
- Seguridad deshabilitada para entorno de laboratorio:
  - `xpack.security.enabled: false`
  - `xpack.security.enrollment.enabled: false`

### Configuración aplicada en Kibana
- Archivo: `/etc/kibana/kibana.yml`
- Acceso externo habilitado:
  - `server.host: "0.0.0.0"`

## Acceso a servicios

| Servicio | URL |
|---|---|
| Kibana | http://192.168.57.5:5601 |
| Elasticsearch | http://192.168.57.5:9200 |

## Próximos pasos
- [ ] Instalar Filebeat en siem-target
- [ ] Configurar Filebeat para enviar logs a Elasticsearch
- [ ] Escribir reglas de detección en Python
- [ ] Construir dashboard en React
- [ ] Migrar a Docker