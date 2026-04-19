alertas_enviadas = set()

def detectar(es, log_alerta):
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"message": "new user"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }
    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]
    for hit in hits:
        evento_id = hit["_id"]
        if evento_id not in alertas_enviadas:
            alertas_enviadas.add(evento_id)
            mensaje = hit["_source"].get("message", "")
            log_alerta(
                "NUEVO USUARIO CREADO",
                f"Evento detectado: {mensaje[:80]}",
                "ALTA"
            )