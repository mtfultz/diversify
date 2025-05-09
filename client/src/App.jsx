import { useMemo }     from 'react';
import usePortfolio    from './hooks/usePortfolio.js';
import usePrices       from './hooks/usePrices.js';
import AddCoin         from './components/AddCoin.jsx';
import PortfolioChart  from './components/PortfolioChart.jsx';

export default function App() {
  /* ---------- portfolio ---------- */
  const { portfolio, save } = usePortfolio('demo');

  /* ---------- live prices ---------- */
  const ids     = portfolio?.coins.map(c => c.coinId) ?? [];
  const prices  = usePrices(ids) ?? {};        // safe fallback object

  /* ---------- helpers ---------- */
  const addCoin = coin => {
    const list = portfolio?.coins ?? [];
    const idx  = list.findIndex(c => c.coinId === coin.coinId);

    if (idx === -1) {
      save([...list, coin]);
    } else {
      const merged = [...list];
      merged[idx] = { ...merged[idx], amount: merged[idx].amount + coin.amount };
      save(merged);
    }
  };

  const removeCoin = id =>
    save((portfolio?.coins ?? []).filter(c => c.coinId !== id));

  /* ---------- totals ---------- */
  const total = useMemo(() => {
    if (!portfolio) return 0;
    return portfolio.coins.reduce((sum, c) => {
      const p = prices[c.coinId]?.usd ?? 0;
      return sum + p * c.amount;
    }, 0);
  }, [portfolio, prices]);

  /* ---------- loading ---------- */
  if (!portfolio) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#18181b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d1d5db',
        fontFamily: 'Inter, sans-serif',
      }}>
        Loading portfolio…
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div style={{
      minHeight: '100vh',
      background: '#18181b',   // dark background everywhere
      color: '#e5e7eb',        // zinc-200
      fontFamily: 'Inter, sans-serif',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Diversify • Portfolio
      </h1>

      <AddCoin onAdd={addCoin} />

      {portfolio.coins.length === 0 ? (
        <p className="text-zinc-400 mt-4">No coins yet — add one above.</p>
      ) : (
        <table style={{ width: '100%', marginTop: '1.5rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #3f3f46' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Coin</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Price&nbsp;(USD)</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Value&nbsp;(USD)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {portfolio.coins.map(c => {
              const p   = prices[c.coinId]?.usd ?? 0;
              const val = p * c.amount;
              return (
                <tr key={c.coinId} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '0.5rem' }}>{c.coinId.toUpperCase()}</td>
                  <td style={{ padding: '0.5rem' }}>{c.amount}</td>
                  <td style={{ padding: '0.5rem' }}>${p.toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>
                    ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button
                      onClick={() => removeCoin(c.coinId)}
                      style={{
                        background: 'transparent',
                        color: '#f87171',
                        border: 0,
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                      aria-label="Remove coin"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '1rem' }}>
        Total Value:&nbsp;
        <span style={{ fontWeight: 600 }}>
          ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </h3>

      <PortfolioChart userId="demo" />
    </div>
  );
}
