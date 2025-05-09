import usePrices from '../hooks/usePrices';

export default function Dashboard() {
  const prices = usePrices(['bitcoin', 'ethereum', 'solana']);

  if (!prices) return <p>Loading…</p>;

  return (
    <div>
      <h2>Spot Prices</h2>
      <ul>
        {Object.entries(prices).map(([id, { usd, usd_24h_change }]) => (
          <li key={id}>
            {id.toUpperCase()}: ${usd.toLocaleString()} ({usd_24h_change.toFixed(2)}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
