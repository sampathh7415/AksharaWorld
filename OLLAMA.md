# Running Ollama locally with Docker Compose

This repository already includes an `ollama` service in `docker-compose.yml`.

## Start the local stack

```powershell
cd /Users/Lenovo/AksharaWorld-git
docker compose -f docker-compose.yml up -d
```

## Check logs

```powershell
docker compose -f docker-compose.yml logs -f ollama
```

## Example clients

- Python: `clients/python/query_ollama.py`
- Node: `clients/node/index.js`

## Notes

- The Ollama HTTP endpoint listens on `localhost:11434`.
- The local Docker volume `ollama-storage` stores models and runtime data.
- If you need a different model, update the request payload or pull the model inside the running container.
