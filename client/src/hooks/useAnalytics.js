import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { useTasks } from "../context/TasksContext.jsx";

/**
 * Loads dashboard/analytics metrics from the API.
 * Refetches whenever a task or category mutation bumps the shared version,
 * so numbers never drift from the list views.
 */
export function useAnalytics({ days = 7 } = {}) {
  const { version } = useTasks();
  const tzOffset = useMemo(() => new Date().getTimezoneOffset(), []);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({
    summary: null,
    completions: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    Promise.all([
      api.get(`/analytics/summary?tzOffset=${tzOffset}`),
      api.get(`/analytics/completions?days=${days}&tzOffset=${tzOffset}`),
    ])
      .then(([summary, completions]) => {
        if (active) setState({ summary, completions, loading: false, error: null });
      })
      .catch((error) => {
        if (active) {
          setState({ summary: null, completions: null, loading: false, error });
        }
      });

    return () => {
      active = false;
    };
  }, [tzOffset, days, version, tick]);

  return { ...state, refresh };
}
