import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

// ── Google Fonts (self-hosted by Next.js — zero layout shift) ──
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Akshara World – Command Center',
  description: '24/7 Autonomous Digital Business Dashboard | AI CEO: Sam',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <ClerkProvider>
          <header style={{
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
          }}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#93c5fd',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={{
                  background: 'rgba(59,130,246,0.9)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
