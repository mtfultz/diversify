import { useState, useEffect } from "react";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

/**
 * Fetch aggregated portfolio history (USD) for the given period.
 * Cancels in-flight fetches when dependencies change.
 */
export default function useHistory(userId = "demo", days = 30, coinKey = null) {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setSeries(null);
    setError(null);

    fetch(`${API}/api/history?userId=${userId}&days=${days}`, {
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((arr) => {
        const pts = arr
          .filter(([, v]) => Number.isFinite(v))
          .map(([ts, v]) => ({ x: +ts, y: +v }));
        setSeries(pts);
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
