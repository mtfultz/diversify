import { useState, useEffect } from 'react';

/**
 * Fetch current USD prices for an array of CoinGecko IDs.
 * Returns { id: { usd, usd_24h_change } }
 */
export default function usePrices(ids = []) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!ids.length) return;

    fetch(`/api/prices?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, [ids.join(',')]); // re-fetch only when the id list truly changes

  return data;
}
