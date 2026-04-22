# Regla de detección: Uso de sudo
# Detecta cuando un usuario ejecuta comandos con sudo.
# Solo cuenta las líneas de COMMAND= (inicio real), ignorando
# las líneas de session opened/closed que PAM genera automáticamente.

import re
import json
from pathlib import Path

# Fichero de estado para persistir entre reinicios
FICHERO_ESTADO = Path(__file__).parent / ".estado_sudo.json"

# IDs de eventos ya procesados para evitar alertar dos veces del mismo comando
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        eventos_procesados = set(json.load(f))
else:
    eventos_procesados = set()

# Expresión regular para extraer el comando ejecutado
PATRON_COMANDO = re.compile(r'COMMAND=(.+?)(?:$|\s*$)')
PATRON_USUARIO = re.compile(r'sudo:\s+(\S+)\s+:')


def guardar_estado():
    """Persiste en disco los IDs de eventos procesados"""
    # Limitamos el tamaño para que no crezca indefinidamente
    eventos_limitados = list(eventos_procesados)[-5000:]
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(eventos_limitados, f)


def detectar(es, log_alerta):
    """
    Detecta usos de sudo en el último minuto.
    Solo considera eventos con 'COMMAND=' para evitar contar
    las líneas session opened/closed que genera PAM.
    """
    query = {
        "size": 100,
        "sort": [{"@timestamp": "desc"}],
        "query": {
            "bool": {
                "must": [
                    {"match_phrase": {"message": "COMMAND="}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    hubo_cambios = False

    for hit in hits:
        evento_id = hit["_id"]

        # Si ya procesamos este evento, lo ignoramos
        if evento_id in eventos_procesados:
            continue

        eventos_procesados.add(evento_id)
        hubo_cambios = True

        # Extraemos usuario y comando del mensaje
        mensaje = hit["_source"].get("message", "")

        match_usuario = PATRON_USUARIO.search(mensaje)
        match_comando = PATRON_COMANDO.search(mensaje)

        usuario = match_usuario.group(1) if match_usuario else "desconocido"
        comando = match_comando.group(1).strip() if match_comando else "desconocido"

        log_alerta(
            "USO DE SUDO",
            f"Usuario {usuario} ejecutó: {comando[:80]}",
            "MEDIA"
        )

    if hubo_cambios:
        guardar_estado()