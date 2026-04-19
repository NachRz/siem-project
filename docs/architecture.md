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