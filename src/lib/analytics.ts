/**
 * 📊 GOOGLE ANALYTICS GA4 — G-QZ4L9XW64F
 * Full event tracking for Akshara World
 * Integrated via next/script — zero layout shift
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-QZ4L9XW64F';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/* ─────────────────────────────────────────────
   CORE — Safe gtag wrapper (handles SSR)
───────────────────────────────────────────── */
function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

/* ─────────────────────────────────────────────
   PAGE VIEW — Call on route change
───────────────────────────────────────────── */
export function gaPageView(url: string) {
  gtag('config', GA_ID, { page_path: url });
}

/* ─────────────────────────────────────────────
   EVENTS — Business-critical tracking
───────────────────────────────────────────── */
export function gaEvent(action: string, params?: Record<string, any>) {
  gtag('event', action, { ...params, send_to: GA_ID });
}

// Purchase funnel
export function gaPurchaseInitiate(item: string, value: number) {
  gaEvent('begin_checkout', {
    currency: 'INR',
    value,
    items: [{ item_name: item, price: value, quantity: 1 }],
  });
}

export function gaPurchaseComplete(transactionId: string, item: string, value: number) {
  gaEvent('purchase', {
    transaction_id: transactionId,
    currency: 'INR',
    value,
    items: [{ item_name: item, price: value, quantity: 1 }],
  });
}

// Lead generation
export function gaContactFormSubmit(subject?: string) {
  gaEvent('generate_lead', { method: 'contact_form', subject });
}

// Content engagement
export function gaBlogRead(title: string) {
  gaEvent('blog_read', { content_type: 'blog', item_id: title });
}

export function gaDownload(item: string) {
  gaEvent('file_download', { file_name: item });
}

// SAM AI interactions
export function gaSamChat(messageType: 'user' | 'sam') {
  gaEvent('sam_chat', { message_type: messageType });
}

export function gaAIJobTrigger(tool: string) {
  gaEvent('ai_job_triggered', { tool_name: tool });
}

// Scout scan
export function gaScoutScan() {
  gaEvent('innovation_scout_scan', { source: 'dashboard' });
}

export { GA_ID };
