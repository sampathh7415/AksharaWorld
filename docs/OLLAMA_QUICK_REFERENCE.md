# Ollama Quick Reference

## Quick Start

```bash
# Start everything
docker-compose up -d

# Pull a model
docker exec akshara-ollama ollama pull mistral

# Test it works
curl http://localhost:11434/api/tags
```

## Essential Commands

### Start/Stop Ollama

```bash
# Start
docker-compose up -d ollama

# Stop
docker-compose down ollama

# Restart
docker-compose restart ollama

# View logs
docker logs akshara-ollama -f
```

### Model Management

```bash
# List installed models
docker exec akshara-ollama ollama list

# Pull a new model
docker exec akshara-ollama ollama pull mistral

# Remove a model
docker exec akshara-ollama ollama rm llama2

# Show model info
docker exec akshara-ollama ollama show mistral
```

### Test Ollama

```bash
# Health check
curl http://localhost:11434/api/tags

# Generate text
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","prompt":"Hello","stream":false}' | jq .response

# Interactive chat test
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","messages":[{"role":"user","content":"What is AI?"}],"stream":false}'
```

## Common Issues & Fixes

### Issue: Connection refused

**Fix:**
```bash
# Check if running
docker ps | grep ollama

# Start it
docker-compose up -d ollama

# Check port
docker port akshara-ollama | grep 11434
```

### Issue: Model download stuck

**Fix:**
```bash
# Cancel and retry with timeout
docker exec -e TIMEOUT=1200 akshara-ollama ollama pull llama2

# Or check available space
docker exec akshara-ollama df -h
```

### Issue: Out of memory

**Fix:**
```bash
# Use smaller model
docker exec akshara-ollama ollama pull mistral  # 7B instead of 13B

# Or increase Docker memory in settings
```

### Issue: API endpoint not working

**Fix:**
```bash
# Verify correct URL
# Inside Docker: http://ollama:11434
# From host: http://localhost:11434

# Check if model is loaded
docker exec akshara-ollama ollama list
```

## Environment Setup

### .env file

```env
# Ollama API URL (use correct one based on context)
OLLAMA_API_URL=http://localhost:11434
# or for Docker services:
OLLAMA_API_URL=http://ollama:11434

# Default model to use
OLLAMA_MODEL=mistral
```

### Docker environment in compose.yaml

```yaml
environment:
  - OLLAMA_HOST=0.0.0.0:11434
  - OLLAMA_MODELS=/root/.ollama/models
```

## Model Recommendations

**For Fast Response Times:**
- mistral (7B)
- neural-chat (7B)
- openchat (7B)

**For Better Quality:**
- llama2 (13B) - if you have 16GB RAM
- codellama (7B) - for code generation

**For Code Tasks:**
- codellama
- mistral

**For Chat:**
- neural-chat
- openchat

## Integration Points

### From Node.js/JavaScript

```javascript
import { Ollama } from 'ollama';
const ollama = new Ollama({ baseUrl: process.env.OLLAMA_API_URL });
const response = await ollama.generate({
  model: 'mistral',
  prompt: 'your prompt'
});
```

### From Python

```python
import requests
response = requests.post(
    'http://localhost:11434/api/generate',
    json={'model': 'mistral', 'prompt': 'hello', 'stream': False}
)
```

### From cURL

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral",
    "prompt": "Your question here",
    "stream": false
  }'
```

## Performance Tips

1. **Use smaller models** for faster response (mistral vs llama2-70b)
2. **Enable GPU** if available for 10x+ speedup
3. **Increase timeouts** for first request (model loading)
4. **Use streaming** for real-time feedback
5. **Pin model in memory** to avoid reload delays

## Monitoring

```bash
# Real-time resource usage
docker stats akshara-ollama

# Full container info
docker inspect akshara-ollama | jq .

# Network usage
docker stats --no-stream akshara-ollama | grep -A1 NAME
```

## Network

- **Local access:** http://localhost:11434
- **Docker network:** http://ollama:11434
- **API port:** 11434
- **Health endpoint:** http://localhost:11434/api/tags

## Storage

- **Model location:** `ollama-storage` Docker volume
- **Storage path:** `/root/.ollama`
- **Persists across:** container restarts

## Useful Links

- API Documentation: https://github.com/ollama/ollama/blob/main/docs/api.md
- Model Library: https://ollama.ai/library
- GitHub Issues: https://github.com/ollama/ollama/issues
