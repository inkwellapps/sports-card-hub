# Sports Card Hub — live (routes grading through CardGrader)

A real, hosted app: upload a card's **front + back** → it calls the **CardGrader AI API** → returns PSA-estimated grade + market value → sets your **85% sale price** → adds it to the Showcase album.

This must run on a host (Railway/Vercel) — a claude.ai page can't call outside APIs. Files:
- `server.js` — Node/Express server + `/api/grade` (routes to CardGrader)
- `public/index.html` — the front-end
- `package.json`

## Deploy on Railway (you already use it for Supp Machine)

### Option A — GitHub → Railway (recommended)
1. Put this folder in a new GitHub repo (e.g. `sports-card-hub`).
2. Railway → **New Project → Deploy from GitHub repo** → pick it.
3. Railway → your service → **Variables** → add:
   - `CARDGRADER_API_KEY` = *(the key Claude sends you in chat — never commit it to the repo)*
4. Railway auto-runs `npm install` + `npm start`. When it's up, **Settings → Networking → Generate Domain** for a public URL.
5. Open that URL → upload a card front + back → **Grade & Price**.

### Option B — Railway CLI
```
npm i -g @railway/cli
railway login
railway init          # in this folder
railway variables set CARDGRADER_API_KEY=THE_KEY_CLAUDE_SENT_YOU
railway up
railway domain        # get the public URL
```

## Credits
- The key above has **3 free trial credits**. A **full grade** = 2 credits → **1 free live grade** to demo.
- More: buy a credit pack (Starter $5 / 25 credits) — CardGrader returns a Stripe checkout link via their API, or buy from your CardGrader dashboard.
- For production, **Strong makes his own CardGrader account + key** and swaps it into `CARDGRADER_API_KEY`.

## Note
Grades are AI estimates from photos (via CardGrader), not official PSA grades. Clear, straight-on front & back photos grade most accurately.
