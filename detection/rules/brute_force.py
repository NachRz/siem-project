# Regla de detección: Fuerza bruta SSH
# Lógica: cuando una IP supera 5 intentos fallidos en el último minuto,
# se genera UNA alerta. No se vuelve a alertar de esa IP hasta que
# pase al menos 1 minuto sin intentos fallidos (ráfaga terminada).

import re
import json
from pathlib import Path

# Fichero de estado para persistir entre reinicios del motor
FICHERO_ESTADO = Path(__file__).parent / ".estado_brute_force.json"

# Conjunto de IPs sobre las que ya emitimos alerta en su ráfaga actual
if FICHERO_ESTADO.exists():
    with open(FICHERO_ESTADO, 'r') as f:
        ips_ya_alertadas = set(json.load(f))
else:
    ips_ya_alertadas = set()

# Umbral de intentos fallidos por IP en la ventana de análisis
UMBRAL_INTENTOS = 5

# Expresión regular para extraer IPs del mensaje del log
PATRON_IP = re.compile(r'from (\d+\.\d+\.\d+\.\d+)')

# Expresión regular para extraer el PID de sshd
# Cada intento SSH tiene un PID único, aunque el log registre 2 líneas
PATRON_PID = re.compile(r'sshd\[(\d+)\]')


def guardar_estado():
    """Persiste en disco las IPs que están en estado 'ya alertada'"""
    with open(FICHERO_ESTADO, 'w') as f:
        json.dump(list(ips_ya_alertadas), f)


def detectar(es, log_alerta):
    """
    Cuenta intentos fallidos por IP en el último minuto.
    Deduplica por PID porque cada intento real tiene un PID único,
    aunque el log a veces lo registre con 2 líneas.
    """
    query = {
        "size": 500,
        "query": {
            "bool": {
                "must": [
                    {"match_phrase": {"message": "Failed password"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }

    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    # Contamos intentos por IP deduplicando por PID del proceso sshd
    # Cada intento real tiene un PID único, los duplicados comparten PID
    intentos_por_ip = {}
    pids_vistos = set()

    for hit in hits:
        mensaje = hit["_source"].get("message", "")

        # Extraemos el PID para deduplicar
        match_pid = PATRON_PID.search(mensaje)
        if not match_pid:
            continue

        pid = match_pid.group(1)
        if pid in pids_vistos:
            continue
        pids_vistos.add(pid)

        # Extraemos la IP del mensaje
        match_ip = PATRON_IP.search(mensaje)
        if match_ip:
            ip = match_ip.group(1)
            intentos_por_ip[ip] = intentos_por_ip.get(ip, 0) + 1

    # IPs que actualmente tienen actividad en la ventana
    ips_activas = set(intentos_por_ip.keys())

    # Alertamos sobre IPs nuevas que superan el umbral
    ips_nuevas_alertas = set()
    for ip, intentos in intentos_por_ip.items():
        if intentos >= UMBRAL_INTENTOS and ip not in ips_ya_alertadas:
            log_alerta(
                "FUERZA BRUTA SSH",
                f"{intentos} intentos fallidos desde la IP {ip} en el último minuto",
                "ALTA"
            )
            ips_nuevas_alertas.add(ip)

    # Añadimos las nuevas alertas al set
    ips_ya_alertadas.update(ips_nuevas_alertas)

    # Limpiamos del set las IPs que ya no están atacando
    ips_inactivas = ips_ya_alertadas - ips_activas
    ips_ya_alertadas.difference_update(ips_inactivas)

    if ips_nuevas_alertas or ips_inactivas:
        guardar_estado()