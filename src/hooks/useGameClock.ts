import { useEffect } from 'react';
import { AppState } from 'react-native';

import { GAME_TICK_MS } from '@/domain/gameBalance';
import { useMapoferStore } from '@/store/useMapoferStore';

export function useGameClock() {
  const hasHydrated = useMapoferStore((state) => state.hasHydrated);
  const applyElapsedTime = useMapoferStore((state) => state.applyElapsedTime);

  useEffect(() => {
    if (!hasHydrated) return;

    applyElapsedTime(Date.now());
    const timer = setInterval(() => applyElapsedTime(Date.now()), GAME_TICK_MS);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') applyElapsedTime(Date.now());
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [applyElapsedTime, hasHydrated]);
}
