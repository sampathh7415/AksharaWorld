'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const HeaderAuth = dynamic(() => import('./HeaderAuth'), { ssr: false });

export default function ClerkHeaderWrapper() {
  return <HeaderAuth />;
}
