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
| Kibana | 8.x | Instalado |
| Logstash | 8.x | Instalado |

### Configuración aplicada
- Seguridad deshabilitada para entorno de laboratorio
- Archivo modificado: `/etc/elasticsearch/elasticsearch.yml`
- Añadido: `xpack.security.enabled: false`
- Añadido: `xpack.security.enrollment.enabled: false`