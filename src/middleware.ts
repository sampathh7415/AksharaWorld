import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// ✅ PUBLIC routes — no auth needed (accessible without sign-in)
const isPublicRoute = createRouteMatcher([
  '/',                            // Public landing page (Brand Hub) at /
  '/dashboard(.*)',               // Private dashboard (Command Center) - guarded by custom Edge JWT password check
  '/public(.*)',                  // Public pages
  '/products(.*)',                // Product pages (visible to customers)
  '/api/auth(.*)',                // Auth endpoints (login, logout)
  '/api/dashboard(.*)',           // Dashboard telemetry data (contains dynamic /api/dashboard/real-data)
  '/api/webhook(.*)',             // Razorpay & external webhooks
  '/api/webhooks(.*)',
  '/api/razorpay-webhook(.*)',
  '/api/newsletter(.*)',          // Newsletter subscribe form
  '/api/contact(.*)',             // Contact form submissions
  '/api/book(.*)',                // Meet booking scheduler form
  '/api/feed(.*)',                // RSS feeds
  '/api/v1/production-agent(.*)',// External agent webhook
])

// 🔒 Everything else (including /) requires Clerk sign-in
// NOTE: proxy.ts convention is Next.js 16+ only.
//       This project uses Next.js 15 — must remain as middleware.ts
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
