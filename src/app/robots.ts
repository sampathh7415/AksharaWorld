/**
 * 🤖 ROBOTS.TXT — aksharaworld.in
 * Tells Google what to crawl and where the sitemap is
 */
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/internal',       // Private dashboard — no indexing
          '/api/',           // API routes
          '/sign-in',
          '/sign-up',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://aksharaworld.in/sitemap.xml',
    host:    'https://aksharaworld.in',
  };
}
