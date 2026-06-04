# Ollama Local AI - Antigravity IDE Configuration
## Provider
- Provider: Ollama (local, offline, free)
- Base URL: http://localhost:11434
## Model Assignment
| Feature | Model | Reason |
|---|---|---|
| Chat / Planning | qwen3.6:latest | Best reasoning, Sam CEO logic |
| Code Completion | qwen2.5-coder:14b | Purpose-built for TypeScript/Next.js |
| Explain / Review | gemma4:latest | Fast, balanced understanding |
| Quick tasks | llama3:latest | Lightweight, fast responses |
| Cloud fallback | minimax-m3:cloud | Large tasks when online |
## Rules for Antigravity IDE
- Use Ollama for ALL AI features (chat, completion, review)
- /src, /sam-brain, /sam-brain-api, /services → qwen2.5-coder:14b
- Architecture, planning, Sam CEO logic → qwen3.6
- Quick explanations, reviews, docs → gemma4
- All models running locally at http://localhost:11434
- Cloud fallback only: minimax-m3:cloud (requires internet)
