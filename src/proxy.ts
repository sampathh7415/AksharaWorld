import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// ✅ PUBLIC routes — no auth needed (accessible without sign-in)
const isPublicRoute = createRouteMatcher([
  '/public(.*)',                  // Public landing page at /public
  '/products(.*)',                // Product pages (visible to customers)
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
// ✅ Next.js 16: proxy.ts replaces deprecated middleware.ts
//    Exports as `proxy` function (was `middleware`). Runs on Node.js runtime.
export const proxy = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// Keep default export for backwards compatibility during transition
export default proxy

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
