/**
 * 🤖 UNIVERSAL COMMERCE PROTOCOL (UCP) MANIFEST
 * Endpoint: GET /.well-known/ucp
 * Google's 2026 agentic commerce standard
 * Allows Google AI Shopping agents to interact with your store
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    version: '1.0',
    merchant: {
      name:        'Akshara World',
      url:         'https://aksharaworld.in',
      country:     'IN',
      currency:    'INR',
      language:    'en',
      category:    'digital_goods',
      contact: {
        email:   'aksharasam@aksharaworld.in',
        support: 'https://aksharaworld.in/public/contact',
      },
    },
    capabilities: {
      productFeed:     'https://aksharaworld.in/api/merchant-feed',
      checkout:        'https://rzp.io/rzp/9O1zMeI',
      shippingPolicy:  'https://aksharaworld.in/public/shipping',
      returnPolicy:    'https://aksharaworld.in/public/refund',
      privacyPolicy:   'https://aksharaworld.in/public/privacy',
      termsOfService:  'https://aksharaworld.in/public/terms',
    },
    fulfillment: {
      type:            'digital',
      delivery:        'instant',
      shippingCost:    0,
      currency:        'INR',
    },
    products: [
      {
        id:          'akshara-ai-blueprint-v1',
        name:        'AI Autonomous Business Blueprint',
        price:       499,
        currency:    'INR',
        availability: 'in_stock',
        url:         'https://aksharaworld.in/public/products/ai-blueprint',
        image:       'https://aksharaworld.in/og-image.jpg',
      },
      {
        id:          'akshara-launch-pilot-v1',
        name:        'Launch Pilot Strategy Pack',
        price:       999,
        currency:    'INR',
        availability: 'in_stock',
        url:         'https://aksharaworld.in/public/products/launch-pilot',
        image:       'https://aksharaworld.in/og-image.jpg',
      },
    ],
  };

  return NextResponse.json(manifest, {
    status:  200,
    headers: {
      'Content-Type':  'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
