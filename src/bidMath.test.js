import { describe, it, expect } from "vitest";
import { bidMath, cashMaxBid, clampRoi, formatRoi, parseEbayLow, prepFor, NO_BID, AUCTION_FEE_MULT, ROI_DEFAULT, ROI_MIN, ROI_MAX, ROI_STEP } from "./bidMath.js";

// README example: Dell OptiPlex 7060 Mini — eBay low $180, $40 prep.
const optiplex = { mkt: { ebay: "$180–$230" }, prep: 40 };

describe("bidMath", () => {
  it("2x ROI matches the README worked example", () => {
    const bm = bidMath(optiplex, 2);
    expect(bm.ebayLow).toBe(180);
    expect(bm.netAfterCosts).toBeCloseTo(116.6, 2);
    expect(bm.afterRoi).toBeCloseTo(58.3, 2);
    expect(bm.maxBid).toBe(45);
    expect(bm.noBid).toBeNull();
    expect(bm.trueCostAtMax).toBeCloseTo(45 * AUCTION_FEE_MULT, 4);
    expect(bm.roiAtMax).toBeGreaterThanOrEqual(2);
  });

  it("1x ROI (the default) is break-even: max bid's all-in cost never exceeds net proceeds", () => {
    expect(ROI_DEFAULT).toBe(1);
    expect(bidMath(optiplex).maxBid).toBe(bidMath(optiplex, 1).maxBid);
    const bm = bidMath(optiplex, 1);
    expect(bm.maxBid).toBe(91);
    expect(bm.trueCostAtMax).toBeLessThanOrEqual(bm.netAfterCosts);
    expect(bm.roiAtMax).toBeGreaterThanOrEqual(1);
    expect(bm.roiAtMax).toBeLessThan(1.02);
  });

  it("higher ROI targets lower the max bid", () => {
    expect(bidMath(optiplex, 4).maxBid).toBeLessThan(bidMath(optiplex, 2).maxBid);
  });

  it("an item that loses money returns No bid, not a $1 floor", () => {
    const bm = bidMath({ mkt: { ebay: "$20–$30" }, prep: 25 }, 2);
    expect(bm.netAfterCosts).toBeLessThan(0);
    expect(bm.noBid).toBe(NO_BID.LOSES_MONEY);
    expect(bm.maxBid).toBe(0);
    expect(bm.trueCostAtMax).toBe(0);
    expect(bm.roiAtMax).toBe(0);
    expect(cashMaxBid(bm.maxBid)).toBe(0);
  });

  it("a profitable item that can't hit the ROI target at $1 returns No bid", () => {
    const item = { mkt: { ebay: "$5–$8" }, prep: 3 };
    expect(bidMath(item, 2).noBid).toBe(NO_BID.BELOW_TARGET);
    expect(bidMath(item, 2).maxBid).toBe(0);
    // ...but clears break-even, so dragging the slider down brings it back.
    expect(bidMath(item, 1).noBid).toBeNull();
    expect(bidMath(item, 1).maxBid).toBe(1);
  });

  it("missing prep cost falls back to the $25 default", () => {
    const bm = bidMath({ mkt: { ebay: "$180" } }, 2);
    expect(bm.prep).toBe(25);
    expect(bm.netAfterCosts).toBeCloseTo(131.6, 2);
    expect(bm.maxBid).toBe(51);
  });

  it("no parseable eBay comps returns No bid", () => {
    expect(bidMath({ mkt: { ebay: "N/A" }, prep: 0 }).noBid).toBe(NO_BID.NO_COMPS);
    expect(bidMath({ mkt: { ebay: "$0" }, prep: 0 }).noBid).toBe(NO_BID.NO_COMPS);
    expect(bidMath({}).noBid).toBe(NO_BID.NO_COMPS);
  });
});

describe("helpers", () => {
  it("parseEbayLow strips commas and takes the low end", () => {
    expect(parseEbayLow("$1,200–$1,600")).toBe(1200);
    expect(parseEbayLow("")).toBe(0);
  });

  it("prepFor maps categories to prep budgets", () => {
    expect(prepFor("Laptops/MacBooks", "Dell Latitude 3400")).toBe(40);
    expect(prepFor("UPS & Power", "APC Back-UPS")).toBe(50);
    expect(prepFor("Lab & Scientific", "Corning PC-420")).toBe(25);
    expect(prepFor("AV & Pro Audio", "60pcs DVI Cables")).toBe(10);
  });

  it("clampRoi snaps to the slider step and range, defaulting on junk", () => {
    expect([ROI_MIN, ROI_MAX, ROI_STEP]).toEqual([1, 5, 0.25]);
    expect(clampRoi("3.2")).toBe(3.25);
    expect(clampRoi("1.3")).toBe(1.25);
    expect(clampRoi("4.9")).toBe(5);
    expect(clampRoi(42)).toBe(5);
    expect(clampRoi(0)).toBe(1);
    expect(clampRoi("abc")).toBe(ROI_DEFAULT);
    expect(clampRoi(null)).toBe(ROI_DEFAULT); // localStorage.getItem() on first visit
    expect(clampRoi("")).toBe(ROI_DEFAULT);
  });

  it("formatRoi shows quarter steps without noise", () => {
    expect(formatRoi(1)).toBe("1.0x");
    expect(formatRoi(1.25)).toBe("1.25x");
    expect(formatRoi(2.5)).toBe("2.5x");
    expect(formatRoi(5)).toBe("5.0x");
  });

  it("cashMaxBid applies the cash bump only to real bids", () => {
    expect(cashMaxBid(45)).toBe(46);
    expect(cashMaxBid(0)).toBe(0);
  });
});
