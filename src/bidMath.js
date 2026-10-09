// Pure bid math — no React, so it can be unit-tested directly (see bidMath.test.js).

export const EBAY_FEE_RATE = 0.13;          // eBay seller fee ~13%
export const EBAY_NET = 1 - EBAY_FEE_RATE;  // 0.87 of sale price after eBay fees
export const ROI_DEFAULT = 1;               // default ROI target on first open (1x = break-even)
export const ROI_MIN = 1;                   // slider lower bound (1x = break-even)
export const ROI_MAX = 5;                   // slider upper bound (5x)
export const ROI_STEP = 0.25;               // slider granularity
export const AUCTION_FEE_MULT = 1.2714;     // 1.18 internet premium × 1.0775 sales tax
export const CASH_BID_MULT = 1.0247;        // bump when paying cash (3% buyer's-premium discount)
export const MIN_BID = 1;                   // Proxibid's lowest possible bid
export const DEFAULT_PREP = 25;

// Why a lot gets "No bid" instead of a number.
export const NO_BID = {
  NO_COMPS: "no-comps",         // no parseable eBay price → value unknown
  LOSES_MONEY: "loses-money",   // eBay low minus fees and prep is ≤ $0
  BELOW_TARGET: "below-target", // profitable, but can't reach the ROI target even at a $1 bid
};

export function parseEbayLow(ebay) {
  if (!ebay) return 0;
  const m = String(ebay).replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

export function prepFor(cat, name) {
  const n = (name || "").toLowerCase();
  if (/sleeve|cables/.test(n)) return 10; // bulk cable lots
  switch (cat) {
    case "Laptops/MacBooks":
    case "Desktops & AIOs":
      return 40; // wipe, reimage, clean, test
    case "Tablets & iPads":
      return 20;
    case "Apple Accessories":
    case "Computer Parts & Docks":
    case "Wire & Cable":
      return 10;
    case "Printers & Scanners":
      return 15;
    case "UPS & Power":
      return 50; // budget for likely battery replacement
    case "Networking":
    case "Notices":
      return 0;
    default:
      return DEFAULT_PREP; // AV, displays, lab, industrial, everything else
  }
}

// "1.0x", "1.25x", "2.5x" — one decimal unless the quarter step needs two.
export function formatRoi(roi) {
  return `${roi.toFixed(Number.isInteger(roi * 2) ? 1 : 2)}x`;
}

export function clampRoi(value) {
  if (value === null || value === undefined || value === "") return ROI_DEFAULT; // nothing saved yet
  const v = Number(value);
  if (!Number.isFinite(v)) return ROI_DEFAULT;
  const snapped = Math.round(v / ROI_STEP) * ROI_STEP;
  return Math.min(ROI_MAX, Math.max(ROI_MIN, snapped));
}

export function bidMath(item, roi = ROI_DEFAULT) {
  const ebayLow = parseEbayLow(item.mkt && item.mkt.ebay);
  const prep = typeof item.prep === "number" ? item.prep : DEFAULT_PREP;
  const ebayFees = ebayLow * EBAY_FEE_RATE;
  const netAfterCosts = ebayLow * EBAY_NET - prep;
  const afterRoi = netAfterCosts / roi;
  const afterAuctionFees = afterRoi / AUCTION_FEE_MULT;

  let noBid = null;
  if (ebayLow <= 0) noBid = NO_BID.NO_COMPS;
  else if (netAfterCosts <= 0) noBid = NO_BID.LOSES_MONEY;
  else if (afterAuctionFees < MIN_BID) noBid = NO_BID.BELOW_TARGET;

  const maxBid = noBid ? 0 : Math.floor(afterAuctionFees);
  const trueCostAtMax = maxBid * AUCTION_FEE_MULT;
  const returnAtMax = netAfterCosts;
  const roiAtMax = trueCostAtMax > 0 ? returnAtMax / trueCostAtMax : 0;
  return { ebayLow, prep, ebayFees, netAfterCosts, afterRoi, afterAuctionFees, maxBid, noBid, trueCostAtMax, returnAtMax, roiAtMax };
}

export function cashMaxBid(maxBid) {
  return maxBid > 0 ? Math.floor(maxBid * CASH_BID_MULT) : 0;
}
