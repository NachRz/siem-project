# Regla de detección: Puerto nuevo abierto
# Compara el snapshot más reciente con la lista histórica de puertos conocidos
# y alerta si detecta un puerto que no estaba en la línea base.
#
# Lógica:
# - Al arrancar, construye la línea base con los puertos de los últimos snapshots
# - En cada ejecución, consulta el último snapshot y compara contra la línea base
# - Si hay puertos en el snapshot actual que no están en la línea base → alerta
# - Los puertos nuevos alertados se añaden a la línea base para no repetir alerta

import re
import json
from pathlib import Path

# Fichero de estado para persistir la línea base de puertos conocidos
FICHERO_ESTADO = Path(__file__).parent / ".estado_puertos_nuevos.json"

# Set de puertos conocidos (línea base)
# Se va ampliando con cada puerto detectado y alertado
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        puertos_conocidos = set(json.load(f))
else:
    puertos_conocidos = set()

# Expresión regular para extraer la lista de puertos del mensaje
PATRON_PUERTOS = re.compile(r'puertos=([^\s]+)')

# Flag para saber si ya construimos la línea base inicial
linea_base_inicializada = len(puertos_conocidos) > 0


def guardar_estado():
    """Persiste en disco la línea base de puertos conocidos"""
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(list(puertos_conocidos), f)


def extraer_puertos(mensaje):
    """
    Extrae el conjunto de puertos del mensaje del log
    Formato esperado: 'puertos=22/tcp,53/tcp,53/udp,...'
    """
    match = PATRON_PUERTOS.search(mensaje)
    if not match:
        return set()

    lista_puertos = match.group(1)
    return set(lista_puertos.split(','))


def detectar(es, log_alerta):
    """
    Consulta el último snapshot de puertos y lo compara contra la línea base.
    Si hay puertos nuevos que no están en la línea base, genera alerta.
    """
    global linea_base_inicializada

    query = {
        "size": 1,
        "sort": [{"@timestamp": "desc"}],
        "query": {
            "match_phrase": {"message": "SIEM_PORTS"}
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    if not hits:
        return

    # Extraemos los puertos del snapshot más reciente
    mensaje = hits[0]["_source"].get("message", "")
    puertos_actuales = extraer_puertos(mensaje)

    # Si es la primera ejecución, la línea base son los puertos actuales
    # y no alertamos sobre ninguno (son los puertos "normales" del sistema)
    if not linea_base_inicializada:
        puertos_conocidos.update(puertos_actuales)
        guardar_estado()
        linea_base_inicializada = True
        return

    # Identificamos los puertos que están ahora y no estaban en la línea base
    puertos_nuevos = puertos_actuales - puertos_conocidos

    if puertos_nuevos:
        for puerto in puertos_nuevos:
            log_alerta(
                "PUERTO NUEVO ABIERTO",
                f"Detectado puerto nuevo en escucha: {puerto}",
                "ALTA"
            )
            # Añadimos a la línea base para no volver a alertar del mismo puerto
            puertos_conocidos.add(puerto)

        guardar_estado()