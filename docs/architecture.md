# Arquitectura del entorno

## VMs

| VM | Hostname | IP | Rol |
|---|---|---|---|
| siem-server | ServerProyecto | 192.168.57.5 | Servidor ELK + SIEM |
| siem-target | pendiente | pendiente | Máquina objetivo |

## Red interna
- Nombre: siem-net
- Rango: 192.168.57.0/24

## Acceso SSH
ssh siem@192.168.57.5