import { useEffect, useRef, useState } from 'react';

/**
 * Keeps the last non-null value mounted for `exitMs` after it becomes null,
 * so overlays can play an exit animation before unmounting.
 * `state` drives the CSS: `data-state="open" | "closed"`.
 */
export function usePresence<T>(value: T | null | undefined, exitMs = 180) {
  const [lingering, setLingering] = useState<T | null>(value ?? null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (value != null) {
      setLingering(value);
      return;
    }
    timer.current = window.setTimeout(() => setLingering(null), exitMs);
    return () => window.clearTimeout(timer.current);
  }, [value, exitMs]);

  return {
    value: (value ?? lingering) as T | null,
    state: value != null ? ('open' as const) : ('closed' as const),
  };
}
