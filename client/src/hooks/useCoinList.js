import { useState, useEffect } from 'react';

/**
 * Returns CoinGecko’s full asset list via your own proxy
 * (avoids CORS + keeps a 24-h server cache).
 */
export default function useCoinList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch('/api/coins/list')          // ← now hits Express, not CoinGecko
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setList)
      .catch(err => {
        console.error('coin list:', err.message);
        setList([]);                  // fall back to empty (no validation)
      });
  }, []);

  return list;
}