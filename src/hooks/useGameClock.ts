import { useEffect } from 'react';

import { useMapoferStore } from '@/store/useMapoferStore';

const TICK_MS = 30_000;

export function useGameClock() {
  const hasHydrated = useMapoferStore((state) => state.hasHydrated);
  const applyElapsedTime = useMapoferStore((state) => state.applyElapsedTime);

  useEffect(() => {
    if (!hasHydrated) return;

    applyElapsedTime(Date.now());
    const timer = setInterval(() => applyElapsedTime(Date.now()), TICK_MS);

    return () => clearInterval(timer);
  }, [applyElapsedTime, hasHydrated]);
}
