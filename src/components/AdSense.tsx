'use client';

/**
 * 💰 GOOGLE ADSENSE — ca-pub-9728864343029052
 * Responsive ad units for aksharaworld.in
 * Ads only show after AdSense approval — no errors before that
 */

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-9728864343029052';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

/**
 * Core AdSense unit — place anywhere on public pages
 */
export function AdUnit({ slot, format = 'auto', style, className, responsive = true }: AdUnitProps) {
  // Only render on client, only on production
  if (typeof window === 'undefined') return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

/**
 * Banner Ad — horizontal strip (728×90 desktop / responsive mobile)
 * Place at top of content pages, below hero sections
 */
export function BannerAd({ className }: { className?: string }) {
  return (
    <AdUnit
      slot="1234567890"  // Replace with real slot ID from AdSense → Ads → By ad unit
      format="horizontal"
      responsive={true}
      className={`w-full py-4 ${className || ''}`}
      style={{ minHeight: '90px' }}
    />
  );
}

/**
 * In-article Ad — flows within blog content
 * Place between paragraphs in blog posts
 */
export function InArticleAd({ className }: { className?: string }) {
  return (
    <div className={`my-8 text-center ${className || ''}`}>
      <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Advertisement</div>
      <AdUnit
        slot="2345678901"  // Replace with real slot ID
        format="auto"
        responsive={true}
        style={{ minHeight: '280px' }}
      />
    </div>
  );
}

/**
 * Sidebar Ad — vertical rectangle
 * Place in blog sidebar or aside panels
 */
export function SidebarAd({ className }: { className?: string }) {
  return (
    <AdUnit
      slot="3456789012"  // Replace with real slot ID
      format="vertical"
      responsive={false}
      className={className}
      style={{ width: '300px', height: '600px' }}
    />
  );
}

/**
 * Auto Ad — Google decides placement automatically
 * Most revenue per page. Add to any content page.
 */
export function AutoAd() {
  return (
    <AdUnit
      slot="4567890123"  // Replace with real slot ID
      format="auto"
      responsive={true}
    />
  );
}

export { PUBLISHER_ID };
