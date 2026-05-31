/**
 * 🎯 GOOGLE PRODUCT STRUCTURED DATA (JSON-LD)
 * Injected into <head> for Google Shopping Rich Results
 * Separate server component to co-exist with 'use client' page
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Autonomous Business Blueprint – ₹499 | Akshara World',
  description: 'Deploy a self-healing digital business with zero recurring infrastructure cost. Full code templates, Edge JWT middleware, Razorpay integration & Google Sheets DB connectors. Instant digital delivery.',
  keywords: ['AI business blueprint', 'autonomous business', 'zero cost startup', 'digital business India', 'aksharaworld'],
  alternates: { canonical: 'https://aksharaworld.in/public/products/ai-blueprint' },
  openGraph: {
    title: 'AI Autonomous Business Blueprint – ₹499 | Akshara World',
    description: 'Deploy a 24/7 self-healing digital business at ₹0 infra cost. Complete production-grade blueprint with code templates.',
    url: 'https://aksharaworld.in/public/products/ai-blueprint',
    images: [{ url: 'https://aksharaworld.in/og-image.jpg', width: 1200, height: 630, alt: 'AI Autonomous Business Blueprint' }],
  },
};

/**
 * Product Structured Data (JSON-LD)
 * Google Shopping uses this to show price, availability, and reviews in search
 */
export function ProductStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AI Autonomous Business Blueprint',
    description: 'The complete production-grade guide to deploying a self-healing digital business with ₹0 infra cost. Includes full code templates for Edge JWT middleware, Razorpay integration, Google Sheets DB connectors, and a 50-point 20-year horizon roadmap.',
    image: 'https://aksharaworld.in/og-image.jpg',
    url: 'https://aksharaworld.in/public/products/ai-blueprint',
    brand: {
      '@type': 'Brand',
      name: 'Akshara World',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Akshara World',
      url: 'https://aksharaworld.in',
    },
    mpn: 'AKW-BLUEPRINT-001',
    sku: 'AKW-BLUEPRINT-001',
    category: 'Digital Download > Business Software > Automation',
    offers: {
      '@type': 'Offer',
      url: 'https://aksharaworld.in/public/products/ai-blueprint',
      priceCurrency: 'INR',
      price: '499',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Akshara World',
        url: 'https://aksharaworld.in',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'MIN',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 5,
            unitCode: 'MIN',
          },
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '12',
      bestRating: '5',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
