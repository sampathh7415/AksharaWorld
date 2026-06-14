"""
AksharaWorld — Ollama Router
Routes AI tasks to the right local model based on task type.
All models run locally on http://localhost:11434 (zero API cost).

Model assignments (per AGENTS.md):
  reasoning  → qwen3.6:latest      (23GB) — CEO logic, planning
  coding     → qwen2.5-coder:14b   (9GB)  — TypeScript, React, Python
  creative   → gemma4:latest        (9.6GB) — content, review
  fast       → llama3:latest        (4.7GB) — quick ops, utilities

Author: Sam | Generated via qwen2.5-coder delegation | 2026-06-14
"""

import json
import urllib.request
import urllib.error
from typing import Optional

# ── Config ────────────────────────────────────────────────────────────────────

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"

MODEL_ROLES: dict[str, str] = {
    "reasoning": "qwen3.6:latest",
    "coding":    "qwen2.5-coder:14b",
    "creative":  "gemma4:latest",
    "fast":      "llama3:latest",
    # aliases
    "planning":  "qwen3.6:latest",
    "review":    "gemma4:latest",
    "code":      "qwen2.5-coder:14b",
    "quick":     "llama3:latest",
    "chat":      "llama3:latest",
    "ui":        "qwen3.6:latest",
}

DEFAULT_ROLE = "coding"
DEFAULT_TIMEOUT = 300  # seconds — large models need time on first load


# ── Core caller ───────────────────────────────────────────────────────────────

def call_ollama(
    model: str,
    prompt: str,
    stream: bool = False,
    system: Optional[str] = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> str:
    """
    POST to Ollama /api/generate and return the response text.
    Returns empty string on any failure (never raises).

    Args:
        model:   Ollama model name (e.g. 'llama3:latest')
        prompt:  The user prompt
        stream:  If True, returns raw streamed text (not recommended for automation)
        system:  Optional system prompt
        timeout: Seconds to wait (default 300 for large models)

    Returns:
        Response text string, or '' on error.
    """
    payload: dict = {"model": model, "prompt": prompt, "stream": stream}
    if system:
        payload["system"] = system

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            OLLAMA_URL,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode("utf-8")
            result = json.loads(body)
            return result.get("response", "")

    except urllib.error.URLError as e:
        print(f"[OllamaRouter] ❌ Connection error ({model}): {e.reason}")
        return ""
    except TimeoutError:
        print(f"[OllamaRouter] ⏱ Timeout after {timeout}s ({model})")
        return ""
    except json.JSONDecodeError as e:
        print(f"[OllamaRouter] ❌ JSON parse error ({model}): {e}")
        return ""
    except Exception as e:
        print(f"[OllamaRouter] ❌ Unexpected error ({model}): {e}")
        return ""


# ── Task router ───────────────────────────────────────────────────────────────

def route_task(
    task_type: str,
    prompt: str,
    system: Optional[str] = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> str:
    """
    Route a task to the best local model and return the response.

    Args:
        task_type: One of the MODEL_ROLES keys (e.g. 'coding', 'fast', 'creative')
        prompt:    The prompt to send
        system:    Optional system prompt override
        timeout:   Seconds to wait

    Returns:
        Model response text, or '' on failure.

    Example:
        result = route_task('coding', 'Write a Python function to parse JSON')
        result = route_task('fast', 'What is 2+2?')
        result = route_task('creative', 'Write a marketing tagline for AksharaWorld')
    """
    model = MODEL_ROLES.get(task_type.lower(), MODEL_ROLES[DEFAULT_ROLE])
    print(f"[OllamaRouter] → {task_type} task → {model}")
    return call_ollama(model, prompt, system=system, timeout=timeout)


# ── Helpers ───────────────────────────────────────────────────────────────────

def list_models() -> list[str]:
    """Return list of locally available Ollama model names."""
    try:
        with urllib.request.urlopen(OLLAMA_TAGS_URL, timeout=5) as r:
            data = json.loads(r.read())
            return [m["name"] for m in data.get("models", [])]
    except Exception as e:
        print(f"[OllamaRouter] Could not list models: {e}")
        return []


def is_ollama_running() -> bool:
    """Return True if Ollama is reachable."""
    try:
        urllib.request.urlopen(OLLAMA_TAGS_URL, timeout=3)
        return True
    except Exception:
        return False


def warm_up(role: str = "fast") -> bool:
    """
    Send a trivial prompt to warm up a model (load into VRAM).
    Returns True if successful.
    """
    model = MODEL_ROLES.get(role, MODEL_ROLES["fast"])
    print(f"[OllamaRouter] Warming up {model}...")
    result = call_ollama(model, "Say: ready", timeout=120)
    ok = bool(result.strip())
    print(f"[OllamaRouter] Warm-up {'✅ OK' if ok else '❌ failed'}")
    return ok


# ── Social media helpers ──────────────────────────────────────────────────────

def generate_caption(topic: str, platform: str = "instagram") -> str:
    """Generate a social media caption using the creative model."""
    prompt = (
        f"Write a compelling {platform} caption for AksharaWorld about: {topic}.\n"
        f"Include a hook line, 3 value points, and a CTA. Add relevant hashtags.\n"
        f"Tone: confident, relatable, Indian professional audience."
    )
    return route_task("creative", prompt, timeout=180)


def generate_code(description: str, language: str = "Python") -> str:
    """Generate code using qwen2.5-coder:14b."""
    prompt = f"Write {language} code for: {description}. No explanation, just code."
    return route_task("coding", prompt, timeout=300)


def quick_answer(question: str) -> str:
    """Get a fast answer using llama3."""
    return route_task("fast", question, timeout=60)


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== AksharaWorld Ollama Router ===\n")

    # Check if Ollama is running
    if not is_ollama_running():
        print("❌ Ollama is not running. Start with: ollama serve")
        exit(1)

    print("✅ Ollama is running")
    models = list_models()
    print(f"📦 Available models: {', '.join(models)}\n")

    print("MODEL_ROLES mapping:")
    for role, model in MODEL_ROLES.items():
        status = "✅" if model.split(":")[0] in " ".join(models) else "⚠️ not installed"
        print(f"  {role:12} → {model:25} {status}")

    print("\n--- Quick test (llama3 fast route) ---")
    result = route_task("fast", "Say hello in one sentence and confirm you are AksharaWorld's local AI.")
    print(f"Response: {result[:200]}")
