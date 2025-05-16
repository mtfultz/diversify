import { useState, useMemo } from "react";

/* ------------------------------------------------------------------
   Utility: polyfill Math.erf (Abramowitz–Stegun 7.1.26 approximation)
------------------------------------------------------------------- */
if (typeof Math.erf !== "function") {
  Math.erf = x => {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736,
          a3 = 1.421413741, a4 = -1.453152027,
          a5 = 1.061405429,  p  = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
                    t * Math.exp(-x * x);
    return sign * y;
  };
}

/* ------------------------------------------------------------------
   Black-Scholes helper (European options, no dividends)
------------------------------------------------------------------- */
const cdf = z => (1 + Math.erf(z / Math.SQRT2)) / 2;

function blackScholes(S, K, T, r, sigma, isCall = true) {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) /
             (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return isCall
    ? S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2)
    : K * Math.exp(-r * T) * cdf(-d2) - S * cdf(-d1);
}

/* ------------------------------------------------------------------
   React page
------------------------------------------------------------------- */
export default function OptionPricing() {
  const [inp, set] = useState({
    S: 30000,      // spot
    K: 32000,      // strike
    T: 0.25,       // years to expiry
    r: 0.04,       // risk-free rate
    v: 0.6,        // volatility (σ)
    type: "call",  // "call" | "put"
  });

  /* memoise price so it only recomputes on input change */
  const price = useMemo(
    () => blackScholes(+inp.S, +inp.K, +inp.T, +inp.r, +inp.v,
                       inp.type === "call"),
    [inp]
  );

  const handle = (field) => (e) => set({ ...inp, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Option Pricing – Black-Scholes
      </h1>

      {/* ------ form ------ */}
      <div className="grid grid-cols-2 gap-4 max-w-md mb-8">
        {[
          ["Spot S", "S"],
          ["Strike K", "K"],
          ["Years T", "T"],
          ["Rate r", "r"],
          ["Vol σ", "v"],
        ].map(([label, key]) => (
          <label key={key} className="flex flex-col text-sm">
            {label}
            <input
              type="number"
              step="any"
              value={inp[key]}
              onChange={handle(key)}
              className="mt-1 rounded bg-zinc-800 px-2 py-1"
            />
          </label>
        ))}

        <label className="flex flex-col text-sm col-span-2">
          Type
          <select
            value={inp.type}
            onChange={handle("type")}
            className="mt-1 rounded bg-zinc-800 px-2 py-1"
          >
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label>
      </div>

      {/* ------ result ------ */}
      <p className="text-xl">
        Price:&nbsp;
        <span className="font-mono">
          {price.toFixed(2)}
        </span>
        &nbsp;USD
      </p>
    </div>
  );
}
