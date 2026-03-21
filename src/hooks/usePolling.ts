"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UsePollingOptions<T> {
  url: string | null;
  interval?: number;
  enabled?: boolean;
  onComplete?: (data: T) => void;
  onError?: (error: string) => void;
  isComplete?: (data: T) => boolean;
}

export function usePolling<T>({
  url,
  interval = 3000,
  enabled = true,
  onComplete,
  onError,
  isComplete,
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completeRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!url || !enabled || completeRef.current) return;

    setLoading(true);
    setError(null);

    const poll = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.error) {
          setError(json.error || json.message);
          stopPolling();
          setLoading(false);
          onError?.(json.error || json.message);
          return;
        }

        if (json.status === "error") {
          setError(json.error || "Error desconocido");
          stopPolling();
          setLoading(false);
          onError?.(json.error || "Error desconocido");
          return;
        }

        setData(json as T);

        if (isComplete?.(json as T)) {
          completeRef.current = true;
          stopPolling();
          setLoading(false);
          onComplete?.(json as T);
        }
      } catch {
        // Network error, keep polling
      }
    };

    poll();
    intervalRef.current = setInterval(poll, interval);

    return () => stopPolling();
  }, [url, interval, enabled, onComplete, onError, isComplete, stopPolling]);

  const reset = useCallback(() => {
    completeRef.current = false;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, stopPolling, reset };
}
