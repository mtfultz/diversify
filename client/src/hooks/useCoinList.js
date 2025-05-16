import { useState, useEffect } from "react";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

/**
 * Returns CoinGecko’s top-200 asset list via your own proxy
 * (avoids CORS + keeps a 24-h server cache).
 */
export default function useCoinList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/coins/list`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setList)
      .catch((err) => {
        console.error("coin list:", err.message);
        setList([]); // silent fallback
      });
  }, []);

  return list;
}
