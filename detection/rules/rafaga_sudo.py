# Regla de detección: Ráfaga de comandos sudo
# Detecta cuando un usuario ejecuta muchos comandos sudo en poco tiempo,
# lo que suele indicar un script automatizado ejecutándose tras comprometer la cuenta.
#
# Lógica:
# - Busca eventos sudo con COMMAND= en los últimos 10 segundos
# - Los agrupa por usuario
# - Si algún usuario tiene más de 5 comandos → alerta ALTA

import re
import json
from pathlib import Path
from datetime import datetime, timedelta

# Fichero de estado para persistir entre reinicios
FICHERO_ESTADO = Path(__file__).parent / ".estado_rafaga_sudo.json"

# Diccionario: usuario → timestamp ISO de la última alerta
# Así evitamos alertar dos veces seguidas del mismo usuario
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        ultimas_alertas = json.load(f)
else:
    ultimas_alertas = {}

# Umbral de comandos para considerar ráfaga
UMBRAL_COMANDOS = 5

# Ventana temporal de análisis (en segundos)
VENTANA_SEGUNDOS = 10

# Cooldown entre alertas del mismo usuario (en segundos)
COOLDOWN_SEGUNDOS = 60

# Expresión regular para extraer el usuario que ejecuta sudo
PATRON_USUARIO = re.compile(r'sudo:\s+(\S+)\s+:')


def guardar_estado():
    """Persiste en disco el diccionario de últimas alertas"""
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(ultimas_alertas, f)


def puede_alertar(usuario):
    """
    Comprueba si podemos alertar de este usuario respetando el cooldown.
    Evita que una misma ráfaga genere 10 alertas consecutivas.
    """
    if usuario not in ultimas_alertas:
        return True

    ultima = datetime.fromisoformat(ultimas_alertas[usuario])
    ahora = datetime.now()

    return (ahora - ultima).total_seconds() >= COOLDOWN_SEGUNDOS


def detectar(es, log_alerta):
    """
    Cuenta comandos sudo por usuario en la ventana reciente.
    Si supera el umbral, genera alerta de ráfaga con cooldown.
    """
    query = {
        "size": 100,
        "sort": [{"@timestamp": "desc"}],
        "query": {
            "bool": {
                "must": [
                    {"match_phrase": {"message": "COMMAND="}},
                    {"range": {"@timestamp": {"gte": f"now-{VENTANA_SEGUNDOS}s"}}}
                ]
            }
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    # Contamos comandos por usuario
    comandos_por_usuario = {}

    for hit in hits:
        mensaje = hit["_source"].get("message", "")
        match = PATRON_USUARIO.search(mensaje)

        if not match:
            continue

        usuario = match.group(1)
        comandos_por_usuario[usuario] = comandos_por_usuario.get(usuario, 0) + 1

    # Comprobamos qué usuarios superan el umbral
    hubo_alertas = False

    for usuario, cantidad in comandos_por_usuario.items():
        if cantidad >= UMBRAL_COMANDOS and puede_alertar(usuario):
            log_alerta(
                "RÁFAGA DE COMANDOS SUDO",
                f"Usuario {usuario} ejecutó {cantidad} comandos sudo en {VENTANA_SEGUNDOS}s (posible script automatizado)",
                "ALTA"
            )
            ultimas_alertas[usuario] = datetime.now().isoformat()
            hubo_alertas = True

    if hubo_alertas:
        guardar_estado()