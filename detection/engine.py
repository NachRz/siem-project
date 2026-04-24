# Motor principal de detección del SIEM
# Ejecuta las reglas de forma periódica y guarda las alertas en Elasticsearch
# Además escribe un heartbeat cada ciclo para que el dashboard sepa que está vivo

from elasticsearch import Elasticsearch
from datetime import datetime
import time

# Importamos cada regla de detección como módulo independiente
from rules import (
    brute_force,
    login_exitoso,
    sudo,
    horario_sospechoso,
    nuevo_usuario,
    archivos_criticos,
    puertos_nuevos,
    comandos_sospechosos,
    rafaga_sudo
)

# Cliente de Elasticsearch apuntando al servidor SIEM
import os
es = Elasticsearch(os.environ.get("ELASTICSEARCH_URL", "http://192.168.57.5:9200"))

# Índice donde se guardarán las alertas generadas por el motor
INDICE_ALERTAS = "alertas-siem"

# Índice del heartbeat para que el dashboard sepa si el motor está vivo
INDICE_HEARTBEAT = "motor-heartbeat"


def log_alerta(tipo, mensaje, severidad):
    """
    Registra una alerta en dos sitios:
    1. Por consola para feedback inmediato al operador
    2. En Elasticsearch para persistencia y visualización en el dashboard
    """
    timestamp = datetime.now()
    timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")

    # Salida por consola
    print(f"[{timestamp_str}] [{severidad}] {tipo}: {mensaje}")

    # Documento que se indexa en Elasticsearch (usando UTC)
    alerta = {
        "@timestamp": datetime.utcnow().isoformat() + "Z",
        "tipo": tipo,
        "mensaje": mensaje,
        "severidad": severidad,
        "origen": "motor-deteccion-python",
        "estado": "nueva"
    }

    try:
        es.index(index=INDICE_ALERTAS, document=alerta)
    except Exception as e:
        print(f"  [ERROR] No se pudo guardar la alerta en Elasticsearch: {e}")


def escribir_heartbeat():
    """
    Escribe un documento 'estoy vivo' en el índice de heartbeat
    El dashboard usa este índice para saber si el motor está activo
    Usa UTC para que sea consistente con las consultas de Elasticsearch
    """
    try:
        es.index(index=INDICE_HEARTBEAT, document={
            "@timestamp": datetime.utcnow().isoformat() + "Z",
            "estado": "vivo"
        })
    except Exception as e:
        print(f"  [ERROR] No se pudo escribir heartbeat: {e}")


if __name__ == "__main__":
    print("Motor de detección iniciado...")
    print(f"Las alertas se guardarán en el índice: {INDICE_ALERTAS}")
    print("Monitorizando siem-target en tiempo real...\n")

    # Bucle principal: ejecuta todas las reglas cada 30 segundos
    while True:
        brute_force.detectar(es, log_alerta)
        login_exitoso.detectar(es, log_alerta)
        sudo.detectar(es, log_alerta)
        horario_sospechoso.detectar(es, log_alerta)
        nuevo_usuario.detectar(es, log_alerta)
        archivos_criticos.detectar(es, log_alerta)
        puertos_nuevos.detectar(es, log_alerta)
        comandos_sospechosos.detectar(es, log_alerta)
        rafaga_sudo.detectar(es, log_alerta)

        # Heartbeat para el panel de salud del dashboard
        escribir_heartbeat()

        time.sleep(30)