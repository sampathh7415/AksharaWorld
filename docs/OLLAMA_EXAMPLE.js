// Example: Ollama Integration with Next.js API Routes
// Place this file in your src/pages/api/ or app/api/ directory

import { Ollama } from 'ollama';

// Initialize Ollama client
const ollama = new Ollama({
  baseUrl: process.env.OLLAMA_API_URL || 'http://ollama:11434',
});

/**
 * Example: Generate text using Ollama
 * Usage: POST /api/ollama/generate
 */
export async function generateCompletion(prompt) {
  try {
    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'mistral',
      prompt: prompt,
      stream: false,
    });
    return response.response;
  } catch (error) {
    console.error('Error generating completion:', error);
    throw error;
  }
}

/**
 * Example: Chat with streaming
 * Usage: POST /api/ollama/chat
 */
export async function chatWithStreaming(messages) {
  try {
    const stream = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'mistral',
      prompt: messages[messages.length - 1]?.content || '',
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}

/**
 * Example: Next.js API Route Handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, prompt, messages } = req.body;

  try {
    if (action === 'generate') {
      const response = await generateCompletion(prompt);
      return res.status(200).json({ response });
    }

    if (action === 'chat') {
      // For streaming responses
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await chatWithStreaming(messages);
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.end();
      return;
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Example: React Component using Ollama
 */
export function OllamaChat() {
  const [input, setInput] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', prompt: input }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error generating response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me something..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Send'}
        </button>
      </form>
      {response && <div className="response">{response}</div>}
    </div>
  );
}

/**
 * Environment Variables (.env.local)
 * 
 * OLLAMA_API_URL=http://localhost:11434
 * OLLAMA_MODEL=mistral
 * 
 * For Docker:
 * OLLAMA_API_URL=http://ollama:11434
 */

/**
 * Installation
 * 
 * npm install ollama
 */

/**
 * Available Models to Use
 * 
 * - mistral (7B) - Fast and efficient
 * - llama2 (7B) - Good general purpose
 * - neural-chat (7B) - Chat optimized
 * - codellama (7B) - Code generation
 * - openchat (7B) - Open domain chat
 * 
 * Pull with: docker exec akshara-ollama ollama pull mistral
 */
