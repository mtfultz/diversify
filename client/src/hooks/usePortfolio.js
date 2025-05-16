import { useState, useCallback, useEffect } from "react";

/**
 * Load + persist one user’s portfolio.
 * Returns { portfolio, save, refresh }.
 */
export default function usePortfolio(userId = "demo") {
  const [data, setData] = useState(null); // { userId, coins: [...] }

  /* fetch once (or on manual refresh) */
  const refresh = useCallback(
    () =>
      fetch(`/api/portfolio/${userId}`)
        .then((r) => r.json())
        .then(setData),
    [userId]
  );

  /* save and immediately update local state */
  const save = (coins) =>
    fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, coins }),
    })
      .then((r) => r.json())
      .then(setData);

  /* run refresh exactly once on mount */
  useEffect(() => {
    refresh(); // ← call, don’t return
  }, [refresh]);

  return { portfolio: data, save, refresh };
}
