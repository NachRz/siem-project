from datetime import datetime

def detectar(es, log_alerta):
    hora_actual = datetime.now().hour
    if hora_actual >= 2 and hora_actual < 6:
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {"message": "Accepted password"}},
                        {"range": {"@timestamp": {"gte": "now-5m"}}}
                    ]
                }
            }
        }
        resultado = es.search(index="filebeat-*", body=query)
        total = resultado["hits"]["total"]["value"]
        if total > 0:
            log_alerta(
                "LOGIN FUERA DE HORARIO",
                f"Acceso exitoso detectado a las {hora_actual}:00h",
                "ALTA"
            )