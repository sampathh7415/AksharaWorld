#!/usr/bin/env python3
"""Simple example to POST a prompt to an Ollama HTTP endpoint and print raw response."""
import argparse
import os
import json
import requests


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--url", default=os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate"), help="Ollama HTTP endpoint URL")
    p.add_argument("--model", default="llama2", help="Model name to request (optional, depends on your Ollama setup)")
    p.add_argument("--prompt", default="Hello from AksharaWorld", help="Prompt to send")
    args = p.parse_args()

    payload = {"model": args.model, "prompt": args.prompt}

    try:
        resp = requests.post(args.url, json=payload, timeout=30)
        resp.raise_for_status()
    except Exception as e:
        print("Request failed:", e)
        return

    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)


if __name__ == "__main__":
    main()
