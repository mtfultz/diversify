/* --------------------------------------------------------------- */
/*  Diversify – CoinGecko proxy (Demo-key style)                   */
/* --------------------------------------------------------------- */

import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import path     from 'path';
import { fileURLToPath } from 'url';

/* ---------- basic server ---------- */
const app  = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

/* ---------- in-memory portfolio store ---------- */
const portfolios = new Map();
portfolios.set('demo', {
  userId: 'demo',
  coins: [
    { coinId: 'bitcoin',  amount: 2   },
    { coinId: 'ethereum', amount: 100 }
]});

/* ---------- caches ---------- */
function ttl(ms) {
  const m = new Map();
  return async (k, fn) => {
    const hit = m.get(k);
    if (hit && Date.now() - hit.t < ms) return hit.v;
    const v = await fn();
    m.set(k, { v, t: Date.now() });
    return v;
  };
}
const cache5m = ttl(5 * 60_000);
const cache1d = ttl(24 * 60*60_000);

/* ---------- CoinGecko helper (demo key via query-param) ---------- */
const CG        = 'https://api.coingecko.com/api/v3';
const DEMO_KEY  = process.env.COINGECKO_API_KEY || process.env.CG_KEY;

let slot = Date.now();                 // simple 2-req/sec token bucket

async function cg(path, qs = '', tries = 2) {
  /* queue so we never exceed ~120/min (well under demo 30/min after cache) */
  const now = Date.now();
  slot = Math.max(slot, now);
  const wait = slot - now;
  slot += 500;                         // next slot
  if (wait) await new Promise(r => setTimeout(r, wait));

  const keyPart = DEMO_KEY ? `${qs ? '&' : '?'}x_cg_demo_api_key=${DEMO_KEY}` : '';
  const url     = `${CG}${path}${qs}${keyPart}`;

  for (let i = 0; i < tries; i++) {
    const r = await fetch(url);
    if (r.ok) return r.json();
    if (r.status === 429 && i === 0) {     // one back-off retry
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }
    throw new Error(`CoinGecko ${r.status}`);
  }
}

/* ---------- /api/coins/list  – TOP-200 by market-cap ---------- */
app.get('/api/coins/list', async (_req, res) => {
  const LIMIT = 200;                                // one place to tweak later
  try {
    /* one-day cache → 1 call / 24 h */
    const data = await cache1d(`top:${LIMIT}`, () =>
      cg(
        '/coins/markets',
        `?vs_currency=usd&order=market_cap_desc&per_page=${LIMIT}&page=1&sparkline=false`
      )
    );

    /* return only the fields the UI needs */
    const trimmed = data.map(({ id, symbol, name }) => ({ id, symbol, name }));
    res.json(trimmed);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});


/* ---------- /api/prices?ids=bitcoin,eth ---------- */
app.get('/api/prices', async (req, res) => {
  const ids = (req.query.ids || '').toLowerCase();
  if (!ids) return res.json({});
  try {
    const data = await cache5m(`prices:${ids}`, () =>
      cg('/simple/price',
         `?ids=${ids}&vs_currencies=usd,btc&include_24hr_change=true`));
    res.json(data);
  } catch (e) { res.status(502).json({ error: e.message }); }
});

/* ---------- portfolio CRUD ---------- */
app.get('/api/portfolio/:userId', (req, res) => {
  res.json(portfolios.get(req.params.userId) || { userId:req.params.userId, coins:[] });
});
app.post('/api/portfolio', (req, res) => {
  const { userId, coins } = req.body;
  portfolios.set(userId, { userId, coins });
  res.json(portfolios.get(userId));
});

/* ---------- /api/history ---------- */
app.get('/api/history', async (req, res) => {
  const { userId = 'demo', days = '30' } = req.query;
  const pf = portfolios.get(userId);
  if (!pf || !pf.coins.length) return res.json([]);

  const key = `${userId}:${days}:${JSON.stringify(pf.coins)}`;
  try {
    const data = await cache5m(key, async () => {
      /* fetch each coin serially (queue already throttles) */
      const merged = new Map();
      for (const { coinId, amount } of pf.coins) {
        const j = await cg(`/coins/${coinId}/market_chart`,
                           `?vs_currency=usd&days=${days}`);
        if (!j.prices) continue;
        for (const [ts, p] of j.prices)
          merged.set(ts, (merged.get(ts) || 0) + p * amount);
      }
      /* append “now” point */
      const ids = pf.coins.map(c => c.coinId).join(',');
      const spot = await cg('/simple/price', `?ids=${ids}&vs_currencies=usd`);
      const nowVal = pf.coins.reduce(
        (sum, c) => sum + (spot[c.coinId]?.usd || 0) * c.amount, 0);
      merged.set(Date.now(), nowVal);

      return [...merged.entries()].sort((a,b) => a[0]-b[0]);
    });
    res.json(data);
  } catch (e) { res.status(502).json({ error: e.message }); }
});

/* ---------- optional static client ---------- */
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '.../public')));
  app.get('/:path(*)', (_req, res) =>
    res.sendFile(path.join(__dirname, '.../public/index.html')));
}

/* ---------- safety-net ---------- */
process.on('unhandledRejection', err =>
  console.error('Unhandled rejection:', err));

/* ---------- start ---------- */
app.listen(PORT, () => {
  console.log(`✅  API on http://localhost:${PORT}`);
});
