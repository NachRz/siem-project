def detectar(es, log_alerta):
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