'use client';

import React from 'react';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

export default function HeaderAuth() {
  return (
    <>
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
    </>
  );
}
