import { useState, useMemo, useEffect } from "react";
import { AUCTION, PRODUCTS, LOTS } from "./data/catalog.js";
import {
  bidMath, cashMaxBid, clampRoi, formatRoi, prepFor, NO_BID,
  ROI_DEFAULT, ROI_MIN, ROI_MAX, ROI_STEP, CASH_BID_MULT, AUCTION_FEE_MULT,
} from "./bidMath.js";

const IMG_BASE = `https://images.proxibid.com/AuctionImages/${AUCTION.sellerId}/${AUCTION.id}`;
const ROI_STORAGE_KEY = "gct-auction-analyzer:roi:v2"; // v2: 1x–5x slider, 1x default

function lotSlug(title) {
  return title.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// One row per lot. Lots sharing a title share one PRODUCTS analysis record.
const ITEMS = LOTS
  .map(([lot, id, price, key, hasImg, status]) => {
    const p = PRODUCTS[key];
    return {
      ...p,
      id, lot, price, sold: status === "sold",
      prep: prepFor(p.cat, p.name),
      url: `https://www.proxibid.com/${lotSlug(p.title)}/lotInformation/${id}`,
      thumb: hasImg ? `${IMG_BASE}/Small/${lot}-1.jpg` : null,
      img: hasImg ? `${IMG_BASE}/FullDetail/${lot}-1.jpg` : null,
    };
  })
  .filter(it => it.cat !== "Notices"); // "DO NOT BID" terms/directions lots

const UNIQUE_PRODUCTS = new Set(ITEMS.map(i => i.title)).size;
const CATS = ["All", ...Array.from(new Set(ITEMS.map(i => i.cat))).sort()];

const BADGE_STYLES = {
  yay: { bg: "#E1F5EE", color: "#0F6E56", label: "GCT Yay" },
  nay: { bg: "#FCEBEB", color: "#A32D2D", label: "Pass" },
  meh: { bg: "#FAEEDA", color: "#854F0B", label: "Conditional" },
};

const NO_BID_TEXT = {
  [NO_BID.NO_COMPS]: "No resale comps — value unknown. Inspect before bidding.",
  [NO_BID.LOSES_MONEY]: "Loses money: eBay low minus fees and prep is $0 or less.",
  [NO_BID.BELOW_TARGET]: "Can't hit this ROI target even at the $1 minimum bid.",
};

function readSavedRoi() {
  try {
    return clampRoi(window.localStorage.getItem(ROI_STORAGE_KEY));
  } catch {
    return ROI_DEFAULT;
  }
}

function money(n) {
  if (!isFinite(n)) return "0";
  const v = Math.round(n * 100) / 100;
  return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
}

function BidRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ color: strong ? "#333" : "#999" }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500, color: strong ? "#c07700" : "#333" }}>{value}</span>
    </div>
  );
}

function Badge({ v }) {
  const s = BADGE_STYLES[v];
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      borderRadius: 12, fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.color, whiteSpace: "nowrap"
    }}>{s.label}</span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "#f5f4f0", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Thumb({ src, alt, size }) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: 6, flexShrink: 0, background: "#f0efeb" };
  if (!src || failed) {
    return <div style={{ ...box, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#bbb" }}>No photo</div>;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={{ ...box, objectFit: "cover" }} />;
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [sort, setSort] = useState("none");
  const [roi, setRoi] = useState(readSavedRoi);

  useEffect(() => {
    try {
      window.localStorage.setItem(ROI_STORAGE_KEY, String(roi));
    } catch {
      // storage blocked (private mode etc.) — slider still works for this visit
    }
  }, [roi]);

  const filtered = useMemo(() => {
    const result = ITEMS.filter(item => {
      if (filter !== "all" && item.v !== filter) return false;
      if (cat !== "All" && item.cat !== cat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(item.name + " " + item.sub + " " + item.cat + " " + item.title + " lot " + item.lot).toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sort === "asc" || sort === "desc") {
      return [...result].sort((a, b) => {
        const diff = bidMath(a, roi).maxBid - bidMath(b, roi).maxBid;
        return sort === "asc" ? diff : -diff;
      });
    }
    return result;
  }, [filter, cat, search, sort, roi]);

  const counts = useMemo(() => ({
    all: ITEMS.length,
    yay: ITEMS.filter(i => i.v === "yay").length,
    meh: ITEMS.filter(i => i.v === "meh").length,
    nay: ITEMS.filter(i => i.v === "nay").length,
  }), []);

  const biddable = useMemo(() => ITEMS.filter(i => !bidMath(i, roi).noBid).length, [roi]);
  // Lots that hammered at or below your max bid — ones you could have won at this ROI.
  const winnable = useMemo(() => ITEMS.filter(i => {
    const bm = bidMath(i, roi);
    return i.sold && !bm.noBid && i.price <= bm.maxBid;
  }).length, [roi]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 960, margin: "0 auto", padding: "24px 16px", color: "#1a1a1a" }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{AUCTION.seller} · {AUCTION.dateLabel}</div>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>GCT Auction Buy Analysis</h1>
        <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
          {AUCTION.title} · {ITEMS.length} lots · {AUCTION.statusLabel} ·{" "}
          <a href={AUCTION.url} target="_blank" rel="noreferrer" style={{ color: "#c07700" }}>Open on Proxibid</a>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Lots analyzed" value={ITEMS.length} sub={`${UNIQUE_PRODUCTS} unique products`} />
        <StatCard label="GCT Yay picks" value={counts.yay} sub="High priority buys" />
        <StatCard label="Conditional" value={counts.meh} sub="Depends on condition/price" />
        <StatCard label="Pass / Skip" value={counts.nay} sub="Not worth GCT time" />
        <StatCard label={`Biddable at ${formatRoi(roi)}`} value={biddable} sub="Lots with a real max bid" />
        <StatCard label={`Winnable at ${formatRoi(roi)}`} value={winnable} sub="Sold at or below your max" />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {[["all", `All (${counts.all})`], ["yay", `GCT Yay (${counts.yay})`], ["meh", `Conditional (${counts.meh})`], ["nay", `Pass (${counts.nay})`]].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "6px 14px", borderRadius: 20, border: filter === v ? "none" : "1px solid #ddd",
            background: filter === v ? (v === "yay" ? "#1D9E75" : v === "nay" ? "#c0392b" : v === "meh" ? "#e67e22" : "#1a1a1a") : "#fff",
            color: filter === v ? "#fff" : "#555", fontSize: 13, cursor: "pointer", fontWeight: filter === v ? 500 : 400
          }}>{label}</button>
        ))}
        <select value={cat} onChange={e => setCat(e.target.value)} style={{
          padding: "6px 10px", borderRadius: 20, border: "1px solid #ddd",
          background: "#fff", fontSize: 13, color: "#555", cursor: "pointer"
        }}>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          padding: "6px 10px", borderRadius: 20, border: "1px solid #ddd",
          background: "#fff", fontSize: 13, color: "#555", cursor: "pointer"
        }}>
          <option value="none">Sort: Lot order</option>
          <option value="desc">Max bid ↓ (highest)</option>
          <option value="asc">Max bid ↑ (lowest)</option>
        </select>
        <input
          type="text" placeholder="Search items or lot #..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #ddd", fontSize: 13, flex: "1 1 160px", minWidth: 120, outline: "none" }}
        />
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        border: "1px solid #eee", background: "#faf9f6", borderRadius: 12,
        padding: "12px 16px", marginBottom: 14
      }}>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 96 }}>
          <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>ROI target</span>
          <span style={{ fontSize: 24, fontWeight: 600, color: "#c07700", lineHeight: 1.1 }}>{formatRoi(roi)}</span>
        </div>
        <div style={{ flex: "1 1 240px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#bbb" }}>{formatRoi(ROI_MIN)}</span>
          <input
            type="range"
            min={ROI_MIN} max={ROI_MAX} step={ROI_STEP} value={roi}
            onChange={e => setRoi(clampRoi(e.target.value))}
            aria-label="ROI target multiplier"
            style={{ flex: 1, accentColor: "#c07700", cursor: "pointer" }}
          />
          <span style={{ fontSize: 11, color: "#bbb" }}>{formatRoi(ROI_MAX)}</span>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", flex: "1 1 100%", maxWidth: 420 }}>
          Drag to set your required return. Higher ROI → lower max bids. Your setting is remembered on this device.
          {roi !== ROI_DEFAULT && (
            <> <button onClick={() => setRoi(ROI_DEFAULT)} style={{ border: "none", background: "none", color: "#c07700", cursor: "pointer", fontSize: 11, padding: 0, textDecoration: "underline" }}>Reset to {formatRoi(ROI_DEFAULT)}</button></>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
        Showing {filtered.length} of {ITEMS.length} lots · Click any row to expand details
      </div>

      <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 14 }}>No items match your filters.</div>
        ) : filtered.map((item, idx) => {
          const isOpen = expandedId === item.id;
          const bm = bidMath(item, roi);
          const overMax = item.sold && !bm.noBid && item.price > bm.maxBid;
          const won = item.sold && !bm.noBid && item.price <= bm.maxBid;
          return (
            <div key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <div
                onClick={() => toggleExpand(item.id)}
                className="lot-row"
                style={{
                  display: "grid", gridTemplateColumns: "56px 1fr auto auto auto auto",
                  gap: 12, alignItems: "center", padding: "12px 16px",
                  cursor: "pointer", background: isOpen ? "#fafafa" : "#fff",
                  transition: "background 0.1s"
                }}
              >
                <Thumb src={item.thumb} alt={item.name} size={56} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "#1a1a1a" }}>
                    <span style={{ color: "#aaa", fontWeight: 400, fontSize: 12 }}>Lot {item.lot} · </span>{item.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item.sub}</div>
                  <div style={{ marginTop: 5 }}><Badge v={item.v} /></div>
                </div>
                <div className="col-ebay" style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>eBay used</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{item.mkt.ebay}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 70 }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    <span className="maxbid-label-full">Max bid</span>
                    <span className="maxbid-label-short">Max</span>
                  </div>
                  {bm.noBid ? (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c0392b" }}>No bid</div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c07700" }}>${bm.maxBid.toLocaleString()}</div>
                  )}
                  <div style={{ fontSize: 11, color: overMax ? "#c0392b" : won ? "#1D9E75" : "#aaa", marginTop: 1 }} title="Final hammer price on Proxibid">
                    {item.sold ? `Sold $${money(item.price)}${overMax ? " ▲" : won ? " ✓" : ""}` : "Passed"}
                  </div>
                </div>
                <div className="col-roi" style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>Est. ROI</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: item.v === "yay" ? "#1D9E75" : item.v === "nay" ? "#c0392b" : "#c07700" }}>{item.roi}</div>
                </div>
                <div style={{ fontSize: 18, color: "#bbb", width: 20, textAlign: "center" }}>
                  {isOpen ? "▲" : "▼"}
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px 16px", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", padding: "14px 0" }}>
                    {item.img ? (
                      <a href={item.img} target="_blank" rel="noreferrer" style={{ flex: "0 1 320px" }}>
                        <img src={item.img} alt={item.name} style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 8, background: "#fff", border: "1px solid #eee" }} />
                      </a>
                    ) : (
                      <Thumb src={null} alt={item.name} size={120} />
                    )}
                    <div style={{ flex: "1 1 260px", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>{item.title}</div>
                      {item.sold ? (
                        <div>Lot {item.lot} · Sold for <strong>${money(item.price)}</strong> hammer (≈ ${money(item.price * AUCTION_FEE_MULT)} all-in with premium + tax)</div>
                      ) : (
                        <div>Lot {item.lot} · <strong>Passed</strong> — no sale</div>
                      )}
                      {overMax && (
                        <div style={{ color: "#c0392b", marginTop: 4 }}>Hammered above your {formatRoi(roi)} max bid of ${bm.maxBid} — you'd have been outbid.</div>
                      )}
                      {won && (
                        <div style={{ color: "#1D9E75", marginTop: 4 }}>Hammered at or below your {formatRoi(roi)} max bid of ${bm.maxBid} — winnable at this target.</div>
                      )}
                      <a href={item.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, color: "#c07700", fontWeight: 500 }}>View lot on Proxibid →</a>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 14 }}>
                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Market value</div>
                      <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                        <span style={{ color: "#aaa" }}>New: </span>{item.mkt.new}<br />
                        <span style={{ color: "#aaa" }}>Used/Refurb: </span>{item.mkt.used}<br />
                        <span style={{ color: "#aaa" }}>eBay sold: </span><strong>{item.mkt.ebay}</strong>
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Notes & insights</div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, color: "#444" }}>{item.notes}</div>
                    </div>
                    <div style={{
                      background: item.v === "yay" ? "#f0faf5" : item.v === "nay" ? "#fff5f5" : "#fff9f0",
                      border: `1px solid ${item.v === "yay" ? "#c3e6d8" : item.v === "nay" ? "#fcc" : "#f5d9a0"}`,
                      borderRadius: 8, padding: "10px 14px"
                    }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>GCT verdict</div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, color: "#333" }}>{item.verdict}</div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "#aaa" }}>Category: </span>
                        <span style={{ fontSize: 11, background: "#eee", padding: "2px 8px", borderRadius: 10, color: "#555" }}>{item.cat}</span>
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Bid calculator</div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, fontVariantNumeric: "tabular-nums" }}>
                        {bm.noBid === NO_BID.NO_COMPS ? (
                          <div style={{ color: "#888" }}>
                            No parseable eBay range (“{item.mkt.ebay}”). <strong style={{ color: "#c0392b" }}>No bid</strong> — value depends on contents; inspect before bidding.
                          </div>
                        ) : (
                          <>
                            <BidRow label="eBay low" value={`$${money(bm.ebayLow)}`} />
                            <BidRow label="− eBay fees (13%)" value={`−$${money(bm.ebayFees)}`} />
                            <BidRow label="− Prep cost" value={`−$${money(bm.prep)}`} />
                            <BidRow label="= Net after costs" value={`$${money(bm.netAfterCosts)}`} />
                            <BidRow label={`÷ ${formatRoi(roi)} ROI target`} value={`$${money(bm.afterRoi)}`} />
                            <BidRow label="÷ Auction fees" value={`$${money(bm.afterAuctionFees)}`} />
                            <div style={{ borderTop: "1px solid #e5e5e5", margin: "6px 0" }} />
                            {bm.noBid ? (
                              <>
                                <BidRow label="Max bid" value="No bid" strong />
                                <div style={{ color: "#c0392b", marginTop: 4 }}>{NO_BID_TEXT[bm.noBid]}</div>
                              </>
                            ) : (
                              <>
                                <BidRow label="Max bid" value={`$${bm.maxBid}`} strong />
                                <BidRow label="True cost at max" value={`$${money(bm.trueCostAtMax)}`} />
                                <BidRow label="Return at max" value={`$${money(bm.returnAtMax)}`} />
                                <BidRow label="ROI at max bid" value={`${bm.roiAtMax.toFixed(2)}x`} />
                              </>
                            )}
                          </>
                        )}
                        {!bm.noBid && (
                          <div style={{ marginTop: 8, fontSize: 11, color: "#aaa" }}>
                            Paying cash? Max bid × {CASH_BID_MULT} = <strong style={{ color: "#c07700" }}>${cashMaxBid(bm.maxBid)}</strong> (3% cash discount).
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "#bbb", marginTop: 12, textAlign: "center" }}>
        Final hammer prices from Proxibid ({AUCTION.snapshotLabel}); hammer excludes the 18% internet premium and 7.75% tax. Market values are analyst estimates from 2025–26 used-market pricing, not live eBay comps. Bid at your own discretion.
      </p>
    </div>
  );
}
