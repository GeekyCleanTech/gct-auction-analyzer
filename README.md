# GCT Auction Buy Analysis

Interactive dashboard for analyzing SD Surplus Auction lots — filter by verdict (GCT Yay / Conditional / Pass), browse by category, search, and expand rows for market value, notes, and ROI verdicts.

Built with **React 18 + Vite**. Deploys to **Cloudflare Pages**.

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL (default <http://localhost:5173>).

## Production build

```bash
npm run build      # outputs static files to dist/
npm run preview    # preview the production build locally
```

## Deploy to Cloudflare Pages

### Option A — Wrangler CLI (direct upload)

```bash
npm run deploy
```

This runs `vite build` then uploads `dist/` via `npx wrangler pages deploy`.
The first run opens a browser to authenticate with your Cloudflare account and,
if the project does not exist yet, creates one named `gct-auction-analyzer`.

### Option B — Connect a Git repository (recommended for CI)

1. Push this folder to a GitHub/GitLab repo.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Use these build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Save and deploy. Every push triggers a new build.

## Max Bid Logic

Every row computes a **suggested maximum bid** at render time from the item's `mkt.ebay`
sold-price range. The lower (conservative) bound of that range is used to protect margin.

### Formula

```text
maxBid = floor( (ebayLow × 0.87 − prepCost) ÷ 2 ÷ 1.2714 )      // floored to a whole dollar, minimum $1
```

| Term                   | Meaning                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ebayLow`              | Lower bound of the eBay sold range (e.g. `"$180–$230"` → `180`). Commas are stripped; if no number is found the max bid falls to the `$1` floor. |
| `× 0.87`               | Strips eBay's **~13% seller fee**, leaving net proceeds.                                                                                         |
| `− prepCost`           | Subtracts estimated **prep cost** per item (table below).                                                                                        |
| `÷ 2`                  | The **2× ROI floor** — the minimum acceptable return.                                                                                            |
| `÷ 1.2714`             | Backs out the **auction fee multiplier** so the bid is what you can pay _on the hammer_.                                                         |
| `floor(...)`, min `$1` | Rounded **down** to whole dollars; never returns less than `$1`.                                                                                 |

### Auction fee multiplier (1.2714)

```text
1.18      × 1.0775   = 1.2714
18% internet   7.75% sales
buyer's premium    tax
```

- **1.18** — the auction's 18% internet/buyer's premium added to the hammer price.
- **1.0775** — 7.75% sales tax applied on top.

Together, every $1 bid actually costs **$1.2714** all-in, so the formula divides by `1.2714`
to convert a target spend back into a safe hammer bid.

### Why a 2× ROI floor

Dividing net-after-costs by **2** means the projected resale return must be at least **double**
the true all-in cost before an item clears the bar. This cushion absorbs condition surprises,
slow sales, fees, and price drift — if a lot can't clear 2× at the conservative eBay low, it isn't worth the bid.

### Prep cost defaults

| Item type                                | Prep |
| ---------------------------------------- | ---- |
| Laptops, MacBooks, mini PCs, AIOs        | $40  |
| Tablets, iPads                           | $20  |
| Networking gear (switches, routers)      | $0   |
| Servers                                  | $0   |
| 3D printers                              | $25  |
| Printers / scanners                      | $15  |
| UPS / power (likely battery replacement) | $50  |
| Chromebooks                              | $20  |
| Bulk lots (cables, sleeves, chargers)    | $10  |
| Everything else                          | $25  |

### Example — Dell OptiPlex 7060 Mini

eBay low `$180`, prep `$40` (mini PC):

```text
eBay low:          $180.00
− eBay fees (13%): −$23.40
− Prep cost:       −$40.00
= Net after costs: $116.60
÷ 2x ROI:          $58.30
÷ 1.2714:          $45.86   → Max bid: $45
─────────────────────────────
True cost at $45:  $57.21   ($45 × 1.2714)
Return:            $116.60
ROI:               2.04x    ($116.60 ÷ $57.21)
```

### Cash discount variant

Paying **cash** earns a 3% discount on the buyer's premium, shifting the fee multiplier from
**1.2714 → 1.2333**. To get the cash-adjusted ceiling, multiply the final max bid by **1.0247**:

```text
cashMaxBid = maxBid × 1.0247
```

For the OptiPlex 7060 above: `$45 × 1.0247 ≈ $46`.

## Project structure

```text
index.html          # Vite entry HTML
src/main.jsx         # React entry point
src/App.jsx          # The auction analysis dashboard component
src/index.css        # Base style reset
public/_redirects    # SPA fallback for Cloudflare Pages
vite.config.js       # Vite + React plugin config
```
