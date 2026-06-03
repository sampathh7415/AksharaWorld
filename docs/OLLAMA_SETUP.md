# Ollama Integration Guide

This document explains how to set up and use Ollama with the AksharaWorld project.

## Overview

Ollama is an open-source local LLM (Large Language Model) runtime that allows you to run language models locally without external API dependencies. This integration enables your project to use offline AI capabilities.

## What is Ollama?

Ollama allows you to:
- Run large language models locally
- Access models via REST API
- Use models offline without internet connectivity
- Optimize inference on different hardware (CPU, GPU)
- Manage multiple model versions

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- 8GB+ RAM (minimum; 16GB+ recommended for better performance)
- Optional: NVIDIA GPU with CUDA support for accelerated inference

### Start Ollama with Docker Compose

```bash
# Start all services including Ollama
docker-compose up -d

# Or use compose (newer syntax)
docker compose up -d
```

This will:
- Start the Ollama service on port 11434
- Start your dashboard services
- Create persistent storage for downloaded models

### Verify Ollama is Running

```bash
# Check if Ollama container is running
docker ps | grep ollama

# Test the API
curl http://localhost:11434/api/tags
```

## Using Ollama

### Pulling Models

Download a model from Ollama's library:

```bash
# Using Ollama CLI inside the container
docker exec akshara-ollama ollama pull llama2

# Or other popular models:
docker exec akshara-ollama ollama pull mistral
docker exec akshara-ollama ollama pull neural-chat
docker exec akshara-ollama ollama pull openchat
```

**Popular Models:**
- `llama2` - Meta's Llama 2 (7B, 13B, 70B versions)
- `mistral` - Mistral 7B
- `neural-chat` - Intel's Neural Chat
- `openchat` - Open Chat model
- `codellama` - Code-specialized Llama
- `dolphin-mixtral` - Dolphin Mixtral model

### List Downloaded Models

```bash
docker exec akshara-ollama ollama list
```

### Using Ollama API from Node.js

Install the Ollama JavaScript client:

```bash
npm install ollama
```

**Example Usage:**

```javascript
import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  baseUrl: 'http://localhost:11434' 
});

// Generate text
const response = await ollama.generate({
  model: 'llama2',
  prompt: 'Why is the sky blue?',
  stream: false,
});

console.log(response.response);

// With streaming
const stream = await ollama.generate({
  model: 'llama2',
  prompt: 'Tell me a story',
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.response);
}
```

### Using Ollama API from HTTP

Make direct REST API calls:

```bash
# Generate completion
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Why is the sky blue?",
    "stream": false
  }'

# Chat completion
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "stream": false
  }'

# List models
curl http://localhost:11434/api/tags
```

## Integration with Your Services

Your dashboard services (`dashboard` and `akshara-dashboard`) can now access Ollama at:

```
http://ollama:11434
```

Or from outside Docker:

```
http://localhost:11434
```

## API Endpoints

### Generate Endpoint

```
POST /api/generate
```

**Request:**
```json
{
  "model": "llama2",
  "prompt": "Your prompt here",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40
  }
}
```

### Chat Endpoint

```
POST /api/chat
```

**Request:**
```json
{
  "model": "llama2",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false
}
```

### List Models

```
GET /api/tags
```

### Model Information

```
GET /api/show?name=llama2
```

## Environment Configuration

Update your `.env` file if needed:

```env
# Ollama configuration
OLLAMA_HOST=ollama:11434
OLLAMA_API_URL=http://ollama:11434
```

Or update in your compose files:

```yaml
environment:
  - OLLAMA_HOST=0.0.0.0:11434
  - OLLAMA_NUM_GPU=1  # For GPU acceleration
```

## GPU Support (NVIDIA)

To enable GPU acceleration with NVIDIA CUDA:

1. Install NVIDIA Docker runtime
2. Uncomment the GPU section in compose.yaml:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

3. Restart:

```bash
docker-compose down
docker-compose up -d
```

## Monitoring

### View Logs

```bash
docker logs akshara-ollama -f
```

### Check Container Stats

```bash
docker stats akshara-ollama
```

### Inspect Running Models

```bash
docker exec akshara-ollama ollama list
```

## Troubleshooting

### Ollama Won't Start

```bash
# Check logs
docker logs akshara-ollama

# Restart the service
docker-compose restart ollama
```

### Model Download Fails

- Ensure you have internet connectivity
- Check available disk space
- Retry the pull command
- Increase timeout: `docker exec -e TIMEOUT=600 akshara-ollama ollama pull llama2`

### Out of Memory

- Reduce model size (use smaller versions like 7B instead of 70B)
- Increase Docker memory allocation
- Stop other services to free memory

### Slow Inference

- CPU inference is slower; consider GPU acceleration
- Use smaller models for faster response times
- Increase system RAM

### Connection Refused

```bash
# Verify Ollama is running
docker ps | grep ollama

# Check port binding
docker port akshara-ollama

# Ensure services use correct URL (http://ollama:11434)
```

## Model Selection Guide

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|-----------|
| neural-chat | 7B | Fast | Good | 8GB |
| mistral | 7B | Fast | Good | 8GB |
| llama2 | 7B | Medium | Very Good | 8GB |
| llama2 | 13B | Slow | Excellent | 16GB |
| codellama | 7B | Medium | Good (Code) | 8GB |
| openchat | 7B | Fast | Good | 8GB |

## Next Steps

1. Pull your preferred model: `docker exec akshara-ollama ollama pull mistral`
2. Update your Node.js services to use the Ollama API
3. Test the integration with simple API calls
4. Scale up to more complex use cases

## Resources

- [Ollama Official Docs](https://ollama.ai)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Ollama JavaScript Library](https://github.com/ollama/ollama-js)
- [Available Models](https://ollama.ai/library)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. View Ollama logs: `docker logs akshara-ollama`
3. Visit Ollama GitHub discussions
4. Check your system resources and Docker configuration
