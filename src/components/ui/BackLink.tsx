'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackLinkProps {
  fallbackHref: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Goes back to the previous page in history when possible; otherwise
 * navigates to `fallbackHref` (e.g. when the page was opened directly).
 */
export default function BackLink({ fallbackHref, className, children }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, etc.) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Link href={fallbackHref} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
