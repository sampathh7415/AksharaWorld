const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || '';

async function replicatePredict(model, input) {
  const create = await fetch('https://api.replicate.com/v1/models/' + model + '/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=90',
    },
    body: JSON.stringify({ input }),
  });
  const pred = await create.json();
  if (!create.ok) throw new Error(pred.detail || pred.title || JSON.stringify(pred));

  let latest = pred;
  if (latest.status === 'succeeded') return latest.output;

  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
      headers: { Authorization: `Bearer ${REPLICATE_TOKEN}` },
    });
    latest = await poll.json();
    if (latest.status === 'succeeded') return latest.output;
    if (latest.status === 'failed' || latest.status === 'canceled') {
      throw new Error(latest.error || 'Generation failed');
    }
  }
  throw new Error('Generation timed out — try again');
}

function demoImageDataUrl(prompt) {
  const safe = prompt.slice(0, 60).replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1f3a"/><stop offset="100%" style="stop-color:#0d9488"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="42%" fill="#e8edf7" font-family="system-ui,sans-serif" font-size="32" text-anchor="middle">AI Image</text>
    <text x="50%" y="54%" fill="#8b9bb8" font-family="system-ui,sans-serif" font-size="16" text-anchor="middle">${safe}</text>
    <text x="50%" y="66%" fill="#22d3a8" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle">Add REPLICATE_API_TOKEN for photoreal output</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function generateImage(prompt) {
  if (REPLICATE_TOKEN.startsWith('r8_')) {
    const output = await replicatePredict('black-forest-labs/flux-schnell', {
      prompt,
      num_outputs: 1,
      aspect_ratio: '1:1',
      output_format: 'webp',
      output_quality: 90,
    });
    const url = Array.isArray(output) ? output[0] : output;
    return { mode: 'replicate', url, prompt };
  }
  await new Promise((r) => setTimeout(r, 1500));
  return { mode: 'demo', url: demoImageDataUrl(prompt), prompt };
}

export async function generateVideo(prompt) {
  if (!REPLICATE_TOKEN.startsWith('r8_')) {
    await new Promise((r) => setTimeout(r, 2000));
    return {
      mode: 'demo',
      message:
        'Demo mode: add REPLICATE_API_TOKEN in .env for real text-to-video. Your credit was used.',
      prompt,
    };
  }
  const output = await replicatePredict('minimax/video-01', { prompt, prompt_optimizer: true });
  const url = Array.isArray(output) ? output[0] : output;
  return { mode: 'replicate', url, prompt };
}

export function aiConfigured() {
  return REPLICATE_TOKEN.startsWith('r8_');
}
