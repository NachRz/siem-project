# Regla de detección: Login exitoso sospechoso
# Detecta logins exitosos desde IPs fuera de la red de confianza.
# Deduplica por PID para que cada intento real cuente una sola vez.

import re
import json
from pathlib import Path

# Fichero de estado para persistir entre reinicios
FICHERO_ESTADO = Path(__file__).parent / ".estado_login_exitoso.json"

# IDs de eventos ya procesados
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        eventos_procesados = set(json.load(f))
else:
    eventos_procesados = set()

# IPs de confianza desde las que nos conectamos normalmente
IPS_CONFIANZA = ["192.168.57.1"]

# Patrones regex para extraer IP y PID
PATRON_IP = re.compile(r'from (\d+\.\d+\.\d+\.\d+)')
PATRON_PID = re.compile(r'sshd\[(\d+)\]')


def guardar_estado():
    """Persiste en disco los IDs de eventos procesados"""
    eventos_limitados = list(eventos_procesados)[-5000:]
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(eventos_limitados, f)


def detectar(es, log_alerta):
    """
    Detecta logins exitosos SSH desde IPs no confiables.
    Deduplica por PID+evento para evitar duplicados de logs.
    """
    query = {
        "size": 100,
        "sort": [{"@timestamp": "desc"}],
        "query": {
            "bool": {
                "must": [
                    {"match_phrase": {"message": "Accepted password"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    hubo_cambios = False
    # PIDs vistos en esta ejecución para deduplicar líneas idénticas del log
    pids_vistos_ahora = set()

    for hit in hits:
        evento_id = hit["_id"]

        # Si ya procesamos este evento entre ejecuciones, lo ignoramos
        if evento_id in eventos_procesados:
            continue

        mensaje = hit["_source"].get("message", "")

        # Deduplicamos por PID dentro de esta ejecución
        match_pid = PATRON_PID.search(mensaje)
        if not match_pid:
            continue

        pid = match_pid.group(1)
        if pid in pids_vistos_ahora:
            eventos_procesados.add(evento_id)
            hubo_cambios = True
            continue

        pids_vistos_ahora.add(pid)
        eventos_procesados.add(evento_id)
        hubo_cambios = True

        # Extraemos la IP de origen
        match_ip = PATRON_IP.search(mensaje)
        if not match_ip:
            continue

        ip = match_ip.group(1)

        # Solo alertamos si la IP no está en la lista de confianza
        if ip not in IPS_CONFIANZA:
            log_alerta(
                "LOGIN EXITOSO SOSPECHOSO",
                f"Login exitoso desde IP no confiable: {ip}",
                "MEDIA"
            )

    if hubo_cambios:
        guardar_estado()