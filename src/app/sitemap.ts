/**
 * 🗺️ AUTO-GENERATED SITEMAP — aksharaworld.in
 * Submitted to Google Search Console automatically
 * Next.js generates this at build time → available at /sitemap.xml
 */
import { MetadataRoute } from 'next';

const BASE_URL = 'https://aksharaworld.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Core pages
    { url: `${BASE_URL}/`,                                         lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/public/contact`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/public/privacy`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/public/terms`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

    // 🛒 GMC-required policy pages
    { url: `${BASE_URL}/public/shipping`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/public/refund`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // 🛍️ Product pages (Google Shopping landing pages)
    { url: `${BASE_URL}/public/products/ai-blueprint`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE_URL}/public/products/launch-pilot`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },

    // Blog / Content (SEO goldmine)
    { url: `${BASE_URL}/blog`,                                                    lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/blog/zero-cost-digital-business`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog/ai-ceo-sam-autonomous-business`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog/cloudflare-workers-edge-runtime`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog/google-sheets-free-database-nextjs`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog/gemini-api-business-automation-india`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // Other landing pages
    { url: `${BASE_URL}/launchpad`,                                lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/saas-scaffold`,                            lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];
}
