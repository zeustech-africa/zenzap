'use client';

import { useEffect, useState } from 'react';

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
