from elasticsearch import Elasticsearch
from datetime import datetime
import time

es = Elasticsearch("http://192.168.57.5:9200")

def log_alerta(tipo, mensaje, severidad):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{severidad}] {tipo}: {mensaje}")

def detectar_fuerza_bruta():
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"message": "Failed password"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }
    resultado = es.search(index="filebeat-*", body=query)
    total = resultado["hits"]["total"]["value"]
    if total >= 5:
        log_alerta(
            "FUERZA BRUTA SSH",
            f"{total} intentos fallidos en el último minuto",
            "ALTA"
        )

def detectar_login_exitoso():
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"message": "Accepted password"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }
    resultado = es.search(index="filebeat-*", body=query)
    total = resultado["hits"]["total"]["value"]
    if total > 0:
        log_alerta(
            "LOGIN EXITOSO",
            f"{total} accesos exitosos en el último minuto",
            "MEDIA"
        )

def detectar_sudo():
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"message": "sudo"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }
    resultado = es.search(index="filebeat-*", body=query)
    total = resultado["hits"]["total"]["value"]
    if total > 0:
        log_alerta(
            "USO DE SUDO",
            f"{total} comandos sudo ejecutados en el último minuto",
            "MEDIA"
        )

if __name__ == "__main__":
    print("Motor de detección iniciado...")
    print("Monitorizando siem-target en tiempo real...\n")
    while True:
        detectar_fuerza_bruta()
        detectar_login_exitoso()
        detectar_sudo()
        time.sleep(30)