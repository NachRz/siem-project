# Regla de detección: Creación de nuevos usuarios en el sistema
# Solo alerta cuando useradd o adduser ejecutan la creación real

# Set en memoria para evitar alertar múltiples veces del mismo evento
alertas_enviadas = set()

def detectar(es, log_alerta):
    query = {
        "query": {
            "bool": {
                # Debe contener alguna de estas frases
                "should": [
                    {"match_phrase": {"message": "new user: name="}},
                    {"match_phrase": {"message": "useradd"}},
                    {"match_phrase": {"message": "new group: name="}}
                ],
                # Al menos una de las condiciones anteriores debe cumplirse
                "minimum_should_match": 1,
                # Filtramos por ventana temporal de 1 minuto
                "must": [
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ],
                # Excluimos sesiones (no son creaciones reales de usuarios)
                "must_not": [
                    {"match_phrase": {"message": "New session"}}
                ]
            }
        }
    }
    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    # Para cada hit, solo alertamos si no lo hicimos antes
    for hit in hits:
        evento_id = hit["_id"]
        if evento_id not in alertas_enviadas:
            alertas_enviadas.add(evento_id)
            mensaje = hit["_source"].get("message", "")
            log_alerta(
                "NUEVO USUARIO CREADO",
                f"Evento detectado: {mensaje[:100]}",
                "ALTA"
            )