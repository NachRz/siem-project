from elasticsearch import Elasticsearch
from datetime import datetime
import time

from rules import brute_force, login_exitoso, sudo

es = Elasticsearch("http://192.168.57.5:9200")

def log_alerta(tipo, mensaje, severidad):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{severidad}] {tipo}: {mensaje}")

if __name__ == "__main__":
    print("Motor de detección iniciado...")
    print("Monitorizando siem-target en tiempo real...\n")
    while True:
        brute_force.detectar(es, log_alerta)
        login_exitoso.detectar(es, log_alerta)
        sudo.detectar(es, log_alerta)
        time.sleep(30)