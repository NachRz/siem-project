# Regla de detección: Comandos sospechosos
# Detecta la ejecución de comandos típicamente usados por atacantes tras comprometer un sistema.
# Busca patrones como netcat, descargas de binarios, chmod +x, rm -rf, base64 -d, etc.

import re
import json
from pathlib import Path

# Fichero de estado para persistir entre reinicios
FICHERO_ESTADO = Path(__file__).parent / ".estado_comandos_sospechosos.json"

# IDs de eventos ya procesados
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        eventos_procesados = set(json.load(f))
else:
    eventos_procesados = set()

# Patrones de comandos sospechosos con su descripción
# Cada patrón tiene: expresión regular + tipo + severidad
PATRONES_SOSPECHOSOS = [
    {
        "patron": re.compile(r'\bnc\s+.*?-e\b', re.IGNORECASE),
        "descripcion": "Netcat con ejecución de shell (posible shell reversa)",
        "severidad": "ALTA"
    },
    {
        "patron": re.compile(r'\bncat\s+.*?-e\b', re.IGNORECASE),
        "descripcion": "Ncat con ejecución de shell (posible shell reversa)",
        "severidad": "ALTA"
    },
    {
        "patron": re.compile(r'\b(wget|curl)\s+.*?(\.sh|\.bin|\.elf|\.exe)\b', re.IGNORECASE),
        "descripcion": "Descarga de ejecutable sospechoso",
        "severidad": "ALTA"
    },
    {
        "patron": re.compile(r'chmod\s+\+x\s+/tmp/', re.IGNORECASE),
        "descripcion": "Chmod +x sobre fichero en /tmp (típico post-explotación)",
        "severidad": "ALTA"
    },
    {
        "patron": re.compile(r'\brm\s+-rf\s+/', re.IGNORECASE),
        "descripcion": "Borrado recursivo en raíz del sistema",
        "severidad": "ALTA"
    },
    {
        "patron": re.compile(r'\bbase64\s+-d\b', re.IGNORECASE),
        "descripcion": "Decodificación base64 (posible payload ofuscado)",
        "severidad": "MEDIA"
    },
    {
        "patron": re.compile(r'python.*-c.*socket', re.IGNORECASE),
        "descripcion": "Python con socket inline (posible shell reversa)",
        "severidad": "ALTA"
    },
    {
        "patron": re.compile(r'/dev/tcp/', re.IGNORECASE),
        "descripcion": "Uso de /dev/tcp (técnica de bash para shell reversa)",
        "severidad": "ALTA"
    }
]


def guardar_estado():
    """Persiste en disco los IDs de eventos procesados"""
    eventos_limitados = list(eventos_procesados)[-5000:]
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(eventos_limitados, f)


def detectar(es, log_alerta):
    """
    Busca eventos recientes que contengan patrones de comandos sospechosos
    tanto en logs de sudo (COMMAND=) como en logs del sistema en general.
    """
    query = {
        "size": 100,
        "sort": [{"@timestamp": "desc"}],
        "query": {
            "bool": {
                # Buscamos en cualquier evento del último minuto
                "must": [
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ],
                # Al menos una de estas palabras clave debe aparecer
                # para hacer la búsqueda más eficiente antes del regex
                "should": [
                    {"match": {"message": "COMMAND"}},
                    {"match": {"message": "nc"}},
                    {"match": {"message": "wget"}},
                    {"match": {"message": "curl"}},
                    {"match": {"message": "chmod"}},
                    {"match": {"message": "base64"}},
                    {"match": {"message": "python"}},
                    {"match": {"message": "/dev/tcp"}}
                ],
                "minimum_should_match": 1
            }
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    hubo_cambios = False

    for hit in hits:
        evento_id = hit["_id"]

        # Saltamos eventos ya procesados
        if evento_id in eventos_procesados:
            continue

        eventos_procesados.add(evento_id)
        hubo_cambios = True

        mensaje = hit["_source"].get("message", "")

        # Probamos cada patrón sospechoso contra el mensaje
        for patron_info in PATRONES_SOSPECHOSOS:
            if patron_info["patron"].search(mensaje):
                # Extraemos solo la parte relevante del mensaje para la alerta
                mensaje_corto = mensaje[:120] if len(mensaje) > 120 else mensaje

                log_alerta(
                    "COMANDO SOSPECHOSO",
                    f"{patron_info['descripcion']} | {mensaje_corto}",
                    patron_info["severidad"]
                )
                # No buscamos más patrones en el mismo mensaje
                break

    if hubo_cambios:
        guardar_estado()