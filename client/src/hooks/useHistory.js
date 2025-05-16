import { useState, useEffect } from "react";

/**
 * Fetch aggregated portfolio history (USD) for the given period.
 * Cancels in-flight fetches when dependencies change (userId, days, or coin list).
 */
export default function useHistory(userId = "demo", days = 30, coinKey = null) {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setSeries(null); // reset series to indicate loading state
    setError(null); // reset previous errors

    fetch(`/api/history?userId=${userId}&days=${days}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((arr) => {
        const pts = arr
          .filter(([, v]) => Number.isFinite(v))
          .map(([ts, v]) => ({ x: +ts, y: +v }));
        setSeries(pts);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("history:", err.message);
          setError(err.message);
        }
      });

    return () => ctrl.abort();
  }, [userId, days, coinKey]);

  return { series, error };
}
