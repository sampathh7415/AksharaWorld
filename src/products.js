export const PRODUCTS = [
  {
    id: 'ai-image-starter',
    name: 'AI Image — Starter',
    description: '25 AI image generations. HD output, any style prompt. Instant studio access.',
    priceCents: 900,
    currency: 'usd',
    type: 'image',
    credits: 25,
    badge: 'Popular',
  },
  {
    id: 'ai-image-pro',
    name: 'AI Image — Pro',
    description: '100 AI images + priority queue. Best for creators and small agencies.',
    priceCents: 2900,
    currency: 'usd',
    type: 'image',
    credits: 100,
    badge: 'Best value',
  },
  {
    id: 'ai-video-starter',
    name: 'AI Video — Starter',
    description: '5 AI video clips (up to 6 sec). Text-to-video from your prompt.',
    priceCents: 1900,
    currency: 'usd',
    type: 'video',
    credits: 5,
  },
  {
    id: 'ai-video-pro',
    name: 'AI Video — Pro',
    description: '20 AI videos + 50 bonus image credits. Full creator bundle.',
    priceCents: 5900,
    currency: 'usd',
    type: 'video',
    credits: 20,
    imageBonus: 50,
  },
  {
    id: 'ai-studio-unlimited',
    name: 'AI Studio — Monthly Pass',
    description: '200 images + 15 videos per month. Auto-renews via Stripe (when subscribed).',
    priceCents: 7900,
    currency: 'usd',
    type: 'bundle',
    credits: 200,
    videoCredits: 15,
    badge: 'Pro',
  },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
