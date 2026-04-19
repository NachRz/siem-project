def detectar(es, log_alerta):
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