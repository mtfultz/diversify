# Diversify – Crypto Portfolio Tracker

A **full-stack** web app that lets you:

- 🔍 Search the top 200+ cryptocurrencies
- ➕ Add amounts to a personal portfolio
- 📈 See 1-year historical returns in a synced, dark-mode chart
- 💵 Track live prices (refreshes every minute)

Built with **React + Vite + Tailwind** on the front-end and an **Express** API that securely proxies the CoinGecko endpoints.

https://diversify-bay.vercel.app/
(note: using a demo coingecko api so it is easily rate limited)

![Diversify dashboard](https://github.com/user-attachments/assets/fdca14e6-2f1b-4cfc-ad5c-3ed16f903f50)

---

## Tech Stack

| Layer         | Tooling & Libraries                       |
| ------------- | ----------------------------------------- |
| Front-end     | React 18, Vite, Tailwind CSS, Recharts    |
| State / Hooks | `usePrices`, `useHistory`, `usePortfolio` |
| Back-end      | Node 20, Express 5, Axios                 |

---

## 1 Quick Start (Local Dev)

# 0) clone

git clone https://github.com/mtfultz/diversify.git && cd diversify

# 1) install all deps (root-level package.json hoists workspaces)

npm ci

# 2) add env vars

cp .env.example .env <BR>
then set COINGECKO_API_KEY=<your key>

# 3) open two terminals for client and server

cd server/
cd client/

# 4) run both services in parallel

node index.js # spawns:

# └─ :4000 → Express API

npm run dev # spawns:

# └─ :5173 → Vite dev-server (proxy /api → :4000)

Open http://localhost:5173 – dark theme + live data should load in seconds.

Coin data provided by CoinGecko (terms apply).
