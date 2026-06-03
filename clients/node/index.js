import fetch from 'node-fetch';
import process from 'process';

const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const model = process.argv[2] || 'llama2';
const prompt = process.argv[3] || 'Hello from Node';

async function main() {
  const body = { model, prompt };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
      console.log(text);
    }
  } catch (err) {
    console.error('Request failed:', err.message || err);
  }
}

main();
