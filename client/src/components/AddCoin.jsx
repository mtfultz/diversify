import { useState, useMemo, useEffect } from 'react';
import { Combobox }                      from '@headlessui/react';
import useCoinList                       from '../hooks/useCoinList.js';
import usePrices                         from '../hooks/usePrices.js';

export default function AddCoin({ onAdd }) {
  const coins = useCoinList();                               // [{ id,name,symbol }]
  const [query, setQuery]   = useState('');                  // combobox text / id
  const [amtCoin, setCoin]  = useState('');                  // crypto units
  const [amtUsd,  setUsd ]  = useState('');                  // USD equivalent

  /* ---------- active coin + live price ---------- */
  const coin   = coins.find(c => c.id === query) || null;    // null if not picked
  const prices = usePrices(coin ? [coin.id] : []) ?? {};     // live price lookup  :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
  const price  = coin ? prices[coin.id]?.usd ?? 0 : 0;       // number | 0

  /* ---------- keep fields in sync when price arrives ---------- */
  useEffect(() => {
    if (!price) return;
    if (amtCoin && !isNaN(+amtCoin)) {
      setUsd((+amtCoin * price).toString());
    } else if (amtUsd && !isNaN(+amtUsd)) {
      setCoin((+amtUsd / price).toString());
    }
  }, [price]);                                               // run once per price load

  /* ---------- filtered dropdown list (top-200 only) ---------- */
  const filtered = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return coins.slice(0, 20);
    return coins.filter(c =>
      c.id.includes(q) ||
      c.symbol.includes(q) ||
      c.name.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [coins, query]);

  /* ---------- submit ---------- */
  const submit = e => {
    e.preventDefault();
    if (!coin) return;                        // nothing chosen
    const units = parseFloat(amtCoin || '0');
    if (!units) return;                       // invalid amount
    onAdd({ coinId: coin.id, amount: units });
    setQuery(''); setCoin(''); setUsd('');
  };

  /* ---------- UI ---------- */
  return (
    <form onSubmit={submit} className="mb-6 flex gap-2 flex-wrap items-center">
      {/* coin combobox */}
      <Combobox value={query ?? ''} onChange={v => setQuery(v ?? '')} as="div" className="relative">
        <Combobox.Input
          className="w-56 px-3 py-1 rounded border border-zinc-700 bg-zinc-800"
          placeholder="Search coin…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded bg-zinc-800 shadow-lg">
          {filtered.map(c => (
            <Combobox.Option
              key={c.id}
              value={c.id}
              className={({ active }) =>
                `cursor-pointer px-3 py-1 ${active ? 'bg-cyan-600 text-white' : ''}`
              }
            >
              {c.name} ({c.symbol.toUpperCase()})
            </Combobox.Option>
          ))}
          {!filtered.length && (
            <div className="px-3 py-1 text-sm text-zinc-400">No results</div>
          )}
        </Combobox.Options>
      </Combobox>

      {/* crypto amount */}
      <input
        type="number"
        step="any"
        value={amtCoin}
        onChange={e => {
          setCoin(e.target.value);
          if (price) setUsd(e.target.value ? (+e.target.value * price).toString() : '');
        }}
        placeholder="Amount"
        className="w-28 px-3 py-1 rounded border border-zinc-700 bg-zinc-800"
      />

      {/* USD amount (bi-directional) */}
      <input
        type="number"
        step="any"
        value={amtUsd}
        onChange={e => {
          setUsd(e.target.value);
          if (price) setCoin(e.target.value ? (+e.target.value / price).toString() : '');
        }}
        placeholder="USD"
        className="w-32 px-3 py-1 rounded border border-zinc-700 bg-zinc-800"
      />

      {/* add */}
      <button className="px-4 py-1 rounded bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white">
        Add
      </button>
    </form>
  );
}
