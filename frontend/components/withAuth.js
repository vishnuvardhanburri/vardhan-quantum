'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

/**
 * Wraps a page component with authentication enforcement.
 * Redirects to /login when the user has no auth token.
 */
export function withAuth(Component) {
  return function AuthenticatedPage(props) {
    const router = useRouter();
    const { isAuthenticated, isReady } = useAuth();

    useEffect(() => {
      if (isReady && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isReady, isAuthenticated, router]);

    if (!isReady) {
      return (
        <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">
          <div className="text-slate-400 text-xs font-mono">Initializing…</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // router.replace will handle redirect
    }

    return <Component {...props} />;
  };
}
