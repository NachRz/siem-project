# Regla de detección: Login exitoso sospechoso
# Solo alerta si detecta logins desde IPs fuera de la red de confianza

# IPs de confianza desde las que nos conectamos normalmente
# Ajustar según el entorno del laboratorio
IPS_CONFIANZA = ["192.168.57.1"]  # IP del host que administra las VMs

# Set en memoria para no duplicar alertas del mismo evento
alertas_enviadas = set()

def detectar(es, log_alerta):
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match_phrase": {"message": "Accepted password"}},
                    {"range": {"@timestamp": {"gte": "now-1m"}}}
                ]
            }
        }
    }
    resultado = es.search(index="filebeat-*", body=query)
    hits = resultado["hits"]["hits"]

    for hit in hits:
        evento_id = hit["_id"]
        mensaje = hit["_source"].get("message", "")

        # Comprueba si el login viene de una IP de confianza
        viene_de_confianza = any(ip in mensaje for ip in IPS_CONFIANZA)

        # Solo alertamos si NO es de confianza y no hemos alertado antes
        if not viene_de_confianza and evento_id not in alertas_enviadas:
            alertas_enviadas.add(evento_id)
            log_alerta(
                "LOGIN EXITOSO SOSPECHOSO",
                f"Login desde IP no confiable: {mensaje[:100]}",
                "MEDIA"
            )