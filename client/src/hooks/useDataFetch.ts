import { useState, useCallback, useEffect } from "react";

interface UseDataFetchOptions {
  retries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface UseDataFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
}

/**
 * Hook for fetching data with built-in error handling and retry logic
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions = {}
): UseDataFetchState<T> {
  const { retries = 3, retryDelay = 1000, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const performFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (retryCount < retries) {
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      } else {
        setError(error);
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, retries, retryDelay, retryCount, onError]);

  useEffect(() => {
    performFetch();
  }, []);

  const retry = useCallback(async () => {
    setRetryCount(0);
    await performFetch();
  }, [performFetch]);

  return { data, loading, error, retry };
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = useState<{
    status: "idle" | "pending" | "success" | "error";
    data: T | null;
    error: Error | null;
  }>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const execute = async () => {
      setState({ status: "pending", data: null, error: null });
      try {
        const response = await asyncFn();
        if (isMounted) {
          setState({ status: "success", data: response, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    };

    execute();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}

/**
 * Hook for handling mutations with loading and error states
 */
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<{
    status: "idle" | "pending" | "success" | "error";
    data: TData | null;
    error: Error | null;
  }>({
    status: "idle",
    data: null,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({ status: "pending", data: null, error: null });
      try {
        const response = await mutationFn(variables);
        setState({ status: "success", data: response, error: null });
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ status: "error", data: null, error: err });
        throw err;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ status: "idle", data: null, error: null });
  }, []);

  return { ...state, mutate, reset };
}
