"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePollingOptions<T> {
  enabled?: boolean;
  runOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

interface UsePollingResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  options: UsePollingOptions<T> = {}
): UsePollingResult<T> {
  const { enabled = true, runOnMount = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(runOnMount && enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use refs to avoid stale closures in setInterval
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const hasFetchedOnce = useRef(false);

  const execute = useCallback(async () => {
    // Only show loading spinner on first fetch
    if (!hasFetchedOnce.current) {
      setIsLoading(true);
    }

    try {
      const result = await fetcherRef.current();
      setData(result);
      setIsError(false);
      setError(null);
      setLastUpdated(new Date());
      hasFetchedOnce.current = true;
      onSuccessRef.current?.(result);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setIsError(true);
      setError(e);
      onErrorRef.current?.(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (runOnMount) {
      execute();
    }

    if (intervalMs <= 0) return;

    const intervalId = setInterval(() => {
      // Pause polling when tab is hidden (Page Visibility API)
      if (document.hidden) return;
      execute();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [enabled, intervalMs, execute, runOnMount]);

  return {
    data,
    isLoading,
    isError,
    error,
    lastUpdated,
    refresh: execute,
  };
}
