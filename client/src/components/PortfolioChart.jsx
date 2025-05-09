import { useMemo }  from 'react';
import Chart        from 'react-apexcharts';
import usePortfolio from '../hooks/usePortfolio.js';
import useHistory   from '../hooks/useHistory.js';
import cgLogo       from '../assets/coingecko.svg';     // ▸ the SVG you just saved

export default function PortfolioChart({ userId = 'demo' }) {
  /* ───── fixed 1-year range ───── */
  const range = 365;

  /* ---- data hooks ---- */
  const { portfolio } = usePortfolio(userId);
  const coinKey       = useMemo(
    () => JSON.stringify(portfolio?.coins || []),
    [portfolio]
  );
  const { series, error } = useHistory(userId, range, coinKey);

  /* ---- apex series & options ---- */
  const chartSeries = series ? [{ data: series, name: 'Portfolio' }] : [];

  const options = useMemo(() => ({
    chart: {
      id:         'portfolio',
      type:       'area',
      background: '#18181b',   // zinc-900
      zoom:       { enabled: true, type: 'x', autoScaleYaxis: true },
      toolbar:    { show: true },
      fontFamily: 'Inter, sans-serif',
    },
    stroke: { width: 2 },
    xaxis:  { type: 'datetime', labels: { format: 'MMM dd \'yy' } },
    yaxis:  { labels: { formatter: v => `$${v.toLocaleString()}` } },
    colors: ['#06b6d4'],       // cyan-500
    theme:  { mode: 'dark' },
  }), []);

  /* ---- render ---- */
  return (
    <div className="mt-8 bg-zinc-800 p-4 rounded">
      {error    && <p className="text-red-400">history error: {error}</p>}
      {!series && !error && <p className="text-zinc-400">Loading chart…</p>}

      {series && (
        <>
          <Chart options={options} series={chartSeries} height={320} width="100%" />

          {/* ───────── CoinGecko attribution ───────── */}
          <div className="mt-2 flex items-center justify-end gap-1 text-xs text-zinc-400">
            <a
              href="https://www.coingecko.com/en/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:underline"
            >
              <img src={cgLogo} alt="CoinGecko" className="h-4 w-auto" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
