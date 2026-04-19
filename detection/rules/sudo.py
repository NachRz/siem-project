def detectar(es, log_alerta):
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