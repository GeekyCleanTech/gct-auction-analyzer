import { useState, useMemo } from "react";

const RAW_ITEMS = [
  {v:"yay",cat:"Laptops/MacBooks",name:"Apple MacBook Air 13.3\" (2020)",sub:"i7-1060NG7 · 8GB · 251GB SSD · WiFi · macOS Sequoia · Multiple units",bid:"$1",mkt:{new:"$1,299",used:"$450–$650",ebay:"$500–$620"},notes:"2020 MacBook Air — i7 variant is rare (most shipped i3/i5). macOS Sequoia = still supported. Best consumer resale appeal of any item in this auction. Multiple units.",verdict:"Bid $150–$200/unit. Resell $480–$600 on eBay. Fastest mover in the catalog. Property mgmt staff laptop option.",roi:"2x–3x"},
  {v:"yay",cat:"Laptops/MacBooks",name:"Apple MacBook Pro 13.3\" (2018)",sub:"i7-8559U · 8GB · 251GB SSD · WiFi · macOS Sequoia",bid:"$1",mkt:{new:"$1,799",used:"$400–$600",ebay:"$420–$530"},notes:"2018 MBP 13\" — Touch Bar model likely. 8GB is weak spot. macOS Sequoia support — verify. Butterfly keyboard era: mention in listing.",verdict:"Bid $100–$175. Resell $420–$520. Or use as GCT loaner/demo machine. Check keyboard condition.",roi:"2.5x–4x"},
  {v:"yay",cat:"Desktops & AIOs",name:"Apple iMac 21.5\" (2019)",sub:"iMac19,2 · i7-8700 · 3.2GHz · 8GB · 1TB Fusion · WiFi · Ventura",bid:"$1",mkt:{new:"$1,499",used:"$350–$550",ebay:"$380–$490"},notes:"Late 2019 21.5\" — one of last Intel iMacs. Fusion Drive is weak (HDD+SSD hybrid). Upgrade tip: add $60 SSD and resale jumps significantly.",verdict:"Bid $100–$150. Add $60 SSD = major boost. Resell $500–$650 after upgrade. Ideal for small biz or home office clients.",roi:"3x–4x with upgrade"},
  {v:"meh",cat:"Desktops & AIOs",name:"Apple iMac 21.5\" (2017)",sub:"iMac18,1 · i5-7360U · 2.3GHz · 8GB · 1TB Fusion · WiFi · Ventura",bid:"$1",mkt:{new:"$1,299",used:"$200–$350",ebay:"$220–$320"},notes:"2017 iMac — still on Ventura but aging. i5 is modest. Fusion drive again. Lower ceiling than 2019 model.",verdict:"Bid $50–$80 only. Resell $220–$300. Use as thin client / reception display. Lower priority than 2019 model.",roi:"3x–4x at $60 bid"},
  {v:"yay",cat:"Laptops/MacBooks",name:"Dell Latitude 5420 14\" (2021)",sub:"i7-1185G7 · 16GB DDR4 · 256GB SSD · WiFi · Win 11 · Multiple units",bid:"$1",mkt:{new:"$1,400",used:"$350–$550",ebay:"$380–$480"},notes:"11th-gen i7 business laptop — excellent spec. 16GB RAM ideal. Win 11 ready. Multiple units listed. Popular corporate fleet model = lots of eBay buyers.",verdict:"Top laptop priority — bid $100–$160. Resell $380–$460. Bundle into GCT laptop support contracts. Great Pinnacle/Beachwalk staff option.",roi:"3x–4x"},
  {v:"yay",cat:"Laptops/MacBooks",name:"Dell Latitude 7400 14\" 2-in-1 (2019)",sub:"i7-8665U · 16GB DDR4 · 512GB SSD · WiFi · USB-C · Win 11",bid:"$1",mkt:{new:"$1,600",used:"$300–$500",ebay:"$320–$450"},notes:"512GB SSD is rare for surplus — big value add. 2-in-1 touchscreen = wider buyer pool. USB-C charging. Strong category.",verdict:"Bid $100–$150. 512GB SSD + 2-in-1 = premium listing. Resell $380–$480. Or use as Prof. Dru SSU demo machine.",roi:"3x–4x"},
  {v:"yay",cat:"Laptops/MacBooks",name:"Dell Latitude 5521 15.6\" (2021)",sub:"i7-11850H · 16GB DDR4 · 256GB SSD · WiFi · Win 11",bid:"$1",mkt:{new:"$1,800",used:"$400–$600",ebay:"$420–$560"},notes:"11th-gen 45W H-series i7 — workstation-class performance. 16GB RAM. Larger 15.6\" screen. Great for developers, content creators. Uncommon at surplus.",verdict:"Bid $120–$180. Large screen = smaller pool but higher value. Resell $420–$550. Great GCT loaner/lab machine.",roi:"3x–4x"},
  {v:"yay",cat:"Laptops/MacBooks",name:"Dell Latitude 5320 13.3\" (2021)",sub:"i7-1185G7 · 16GB DDR4 · 256GB SSD · WiFi · Win 11 · Multiple units",bid:"$1",mkt:{new:"$1,350",used:"$330–$500",ebay:"$350–$460"},notes:"Near-identical to 5420 in smaller chassis. Multiple PARTS lots mixed in — verify condition carefully. Multiple units available.",verdict:"Bid $80–$130. CRITICAL: verify full unit vs PARTS lot. Resell $350–$440 for working units. PARTS lots: bid $1–$10 only.",roi:"3x–4x working units"},
  {v:"yay",cat:"Laptops/MacBooks",name:"Dell Latitude 7320 13.3\" Tablet (2021)",sub:"i7-1180G7 · 16GB DDR4 · 256GB SSD · WiFi · USB-C · Win 11",bid:"$1",mkt:{new:"$1,800",used:"$350–$550",ebay:"$380–$500"},notes:"11th-gen business tablet. 16GB RAM. Detachable keyboard likely — check listing. Used by field workers, sales reps.",verdict:"Bid $100–$160. Check if keyboard included. Resell $380–$500. Great field tech / property mgmt device.",roi:"3x–4x"},
  {v:"meh",cat:"Laptops/MacBooks",name:"Dell Latitude 7200 12.3\" 2-in-1 Tablet",sub:"i7-8665U · 16GB · 512GB SSD · WiFi · USB-C · Win 11",bid:"$1",mkt:{new:"$1,800",used:"$300–$500",ebay:"$280–$420"},notes:"512GB + 16GB is excellent spec. USB-C only. Check if keyboard folio included — significantly adds value.",verdict:"Bid $80–$130 without keyboard. Check for keyboard/folio. Resell $300–$420. Field tech / property mgmt use case.",roi:"2.5x–4x"},
  {v:"meh",cat:"Laptops/MacBooks",name:"Dell Latitude 5490 & 7390 (2018)",sub:"i7-8650U · 1.9GHz · 8GB DDR4 · 256GB SSD · WiFi · Win 11",bid:"$1",mkt:{new:"$1,300",used:"$180–$320",ebay:"$200–$300"},notes:"Older 8th-gen business laptops. Functional but aging. 8GB RAM is the weak point for 2024 use.",verdict:"Bid $40–$70. Resell $180–$280. Or use as GCT spare/loaner. Lower priority than 5420/5320.",roi:"3x–4x"},
  {v:"yay",cat:"Desktops & AIOs",name:"Dell OptiPlex 7490 23.8\" AIO",sub:"i7-11700 · 8GB DDR4 · 256GB SSD · WiFi · Win 11",bid:"$1",mkt:{new:"$1,600",used:"$400–$600",ebay:"$420–$550"},notes:"Newest AIO in lineup — 11th-gen i7. Built-in 23.8\" screen = complete workstation. NO STAND on some units — verify. Great for reception desks, shared workstations.",verdict:"Bid $120–$180. Confirm stand included or add $20 VESA. Resell $440–$560. Deploy at Pinnacle/Capital Asset sites.",roi:"3x–4x"},
  {v:"yay",cat:"Desktops & AIOs",name:"Dell OptiPlex 7480 23.8\" AIO",sub:"i7-10700 · 8GB DDR4 · 256GB SSD · HDMI · Win 11 · ~15 units",bid:"$1",mkt:{new:"$1,400",used:"$300–$500",ebay:"$320–$460"},notes:"15+ units in catalog — massive fleet opportunity. No WiFi on most = add $15 USB WiFi dongle. NO STAND on many — verify. All-in-one = plug-and-play for clients.",verdict:"Bid $80–$130 each on 4–8 units. Add $15 USB WiFi per unit. Deploy to property mgmt as fleet upgrade. Resell others $330–$420.",roi:"3x–4x at $100 + $15 WiFi"},
  {v:"meh",cat:"Desktops & AIOs",name:"Dell OptiPlex 7470 23.8\" AIO",sub:"i7-9700 · 8GB DDR4 · 256GB SSD · WiFi · Win 11",bid:"$1",mkt:{new:"$1,300",used:"$280–$450",ebay:"$300–$420"},notes:"9th-gen AIO. WiFi included on at least one variant. Fewer units than 7480. Solid second-tier AIO.",verdict:"Bid $70–$110. Good but 7480/7490 are higher priority. Resell $300–$400. Property mgmt waiting room use.",roi:"3x–4x at $80 bid"},
  {v:"meh",cat:"Desktops & AIOs",name:"Dell OptiPlex 7460 AIO",sub:"i7-8700 · 3.2GHz · 8GB DDR4 · 256GB SSD · WiFi · Win 11",bid:"$1",mkt:{new:"$1,200",used:"$250–$400",ebay:"$260–$370"},notes:"8th-gen all-in-one. Win 11 capable. Two variants (with and without stand). Decent resale, lower ceiling.",verdict:"Bid $60–$90. Lower priority — only bid if newer AIO lots get expensive. Resell $270–$370.",roi:"3x–4x at $70 bid"},
  {v:"yay",cat:"Desktops & AIOs",name:"Dell OptiPlex 7000 Mini ★ BEST SPEC",sub:"i7-12700 · 16GB DDR4 · 256GB SSD · WiFi · DP · Win 11",bid:"$1",mkt:{new:"$1,600",used:"$350–$500",ebay:"$380–$450"},notes:"12th-gen i7 + 16GB = best spec mini PC in auction. 2022-era hardware, still very relevant. Highest resale ceiling of all OptiPlex lots. DP only — check monitor compatibility.",verdict:"HIGHEST PRIORITY mini PC — bid up to $150. Resell $400–$480 after wipe. Or keep as AI edge inference node (Ollama). SSU lab demo machine.",roi:"3x–4x even at $120"},
  {v:"yay",cat:"Desktops & AIOs",name:"Dell OptiPlex 7080 Mini",sub:"i7-10700 · 8GB DDR4 · 256GB SSD · WiFi · DP · Win 11 · 2 units",bid:"$1",mkt:{new:"$1,400",used:"$200–$350",ebay:"$230–$290"},notes:"10th-gen upgrade from 7060. Higher resale ceiling. Two units. Good internal loaner stock.",verdict:"Bid $50–$80 each. Both worth grabbing. Resell $250–$320 or keep as loaners. Upgrade RAM to 16GB ($20) for premium listing.",roi:"3x–5x"},
  {v:"yay",cat:"Desktops & AIOs",name:"Dell OptiPlex 7060 Mini",sub:"i7-8700 · 8GB DDR4 · 256GB SSD · WiFi · DP/HDMI · Win 11 · 6+ units",bid:"$1",mkt:{new:"$1,200",used:"$150–$280",ebay:"$180–$230"},notes:"6+ units in catalog. Most popular MSP-grade mini PC at auction. Well-supported, easy to image and deploy. Dual DP+HDMI output.",verdict:"6+ units — buy 4–6 at $40–$80 each. Resell refurbed $175–$225. Deploy as Beachwalk/Pinnacle fleet. Add RAM for $20 to push value to $250+.",roi:"2x–4x"},
  {v:"meh",cat:"Desktops & AIOs",name:"Dell OptiPlex 7070 Mini",sub:"i7-9700 · 8GB DDR4 · 256GB SSD · WiFi · DP · Win 11",bid:"$1",mkt:{new:"$1,300",used:"$180–$280",ebay:"$190–$250"},notes:"9th-gen midpoint. Single unit. Solid but not priority over 7060/7080.",verdict:"Bid $40–$60. Good but not priority over 7060/7080 lots. Resell $200–$260. Or keep as internal spare.",roi:"3x–4x"},
  {v:"nay",cat:"Desktops & AIOs",name:"Dell OptiPlex 9020 Desktop",sub:"i7-4770 · 3.4GHz · 32GB DDR3 · 500GB SATA · No WiFi/BT · Win 10",bid:"$1",mkt:{new:"$900 (era)",used:"$60–$120",ebay:"$70–$110"},notes:"4th-gen i7 from 2013. Win 10 EOL. No WiFi/BT = deployment blocker. Tower form factor. 32GB RAM is the only bright spot.",verdict:"Pass. Win 10 EOL kills client deployment. No WiFi = not plug-and-play. Pull 32GB RAM for lab repurpose. Bid $1 max — parts only.",roi:"Parts only"},
  {v:"meh",cat:"Desktops & AIOs",name:"Dell OptiPlex 9030 23.8\" AIO",sub:"i5-4590 · 3.0GHz · 8GB DDR3 · 500GB SATA · WiFi · Win 10 · 2 units",bid:"$1",mkt:{new:"$800 (era)",used:"$80–$150",ebay:"$90–$140"},notes:"Older 4th-gen AIO. Win 10 EOL is a problem. SATA HDD = slow. Complete all-in-one at minimal bid.",verdict:"Bid $5–$15 max. Win 10 EOL kills client-facing deployment. Keep for internal use or strip for parts. Not worth eBay listing as-is.",roi:"Low — parts/internal only"},
  {v:"yay",cat:"Networking",name:"Cisco Catalyst 9500 ★ HIGHEST VALUE",sub:"C9500-48Y4C · 2 units · 48x25G + 4x100G uplinks",bid:"$1",mkt:{new:"$25,000+",used:"$3,000–$8,000",ebay:"$3,500–$7,000"},notes:"Enterprise-grade core switch — datacenter class. 48x 25G SFP28 + 4x 100G QSFP28 uplinks. Most valuable networking item in this auction. Needs Cisco SmartNet for full features but huge resale to IT shops.",verdict:"HIGHEST VALUE ITEM — bid $800–$2,000 each. Resell $3,000–$6,000 even without SmartNet. Partner with Cisco VAR for licensing. This alone pays for your auction day.",roi:"3x–5x even at $1,500 bid"},
  {v:"yay",cat:"Networking",name:"Cisco ASR-9001 Routers",sub:"4 units · Service provider grade",bid:"$1",mkt:{new:"$30,000+",used:"$1,000–$5,000",ebay:"$1,200–$4,500"},notes:"Carrier/ISP-grade routers — 4 units. Sophisticated buyer pool (MSPs, ISPs, Cisco resellers). Licensing required for full use. Very high ceiling if condition is good.",verdict:"Bid $300–$800 each. Resell $1,200–$4,000 each to ISP/enterprise buyers. 4 units = significant inventory. Requires Cisco expertise to verify before listing.",roi:"3x–8x"},
  {v:"yay",cat:"Networking",name:"Cisco ASR1001-X Enterprise Router",sub:"RackMount · Single unit",bid:"$1",mkt:{new:"$15,000+",used:"$800–$2,500",ebay:"$800–$2,000"},notes:"Enterprise WAN router — ISP-edge class. Requires IOS XE licensing for full features. Strong resale to IT resellers and integrators.",verdict:"Bid $200–$500. Resell $800–$1,800 to IT reseller/eBay. Partner with Cisco VAR for licensing upsell. Niche buyer pool but high value.",roi:"3x–5x"},
  {v:"yay",cat:"Networking",name:"Cisco Catalyst 3560-CX PoE Switches",sub:"WS-C3560CX-8PC-L · 2 units · 8-port PoE",bid:"$1",mkt:{new:"$1,800",used:"$200–$450",ebay:"$220–$400"},notes:"Compact PoE switch — perfect for small office deployments. 8-port PoE powers IP phones, APs. Immediate GCT deployment use (UniFi APs + IP phones).",verdict:"Bid $50–$100 each. Deploy at Beachwalk Villas or Broadway Towers. Or resell $220–$350 to IT shops. Great PoE for property mgmt networks.",roi:"3x–5x"},
  {v:"yay",cat:"Networking",name:"Cisco Catalyst 2960-CX PoE (x6)",sub:"WS-C2960CX-8PC-L · 6 units · PoE",bid:"$1",mkt:{new:"$1,200",used:"$100–$250",ebay:"$110–$230"},notes:"6 units of small PoE switches. Entry-level Catalyst. Good for small branch deployments. GCT could deploy across multiple property mgmt client sites.",verdict:"Bid $20–$50 each. 6 units = fleet buy for property mgmt deployments. Resell $110–$200 each. Deploy at new client sites as managed service.",roi:"3x–5x"},
  {v:"yay",cat:"Networking",name:"Cisco Catalyst 2960-X Stackable (x9)",sub:"9 units · Gigabit managed · Stackable",bid:"$1",mkt:{new:"$2,500",used:"$150–$400",ebay:"$150–$350"},notes:"9 units — full campus stack. Stackable = chain for high port count. Gigabit managed switches for office/commercial.",verdict:"Bid $30–$70 each. 9 units = massive resale inventory or multi-site deployment. Resell $150–$300 each to IT shops. Or deploy across Capital Asset / Pinnacle sites.",roi:"3x–5x"},
  {v:"meh",cat:"Networking",name:"Cisco Business 350 Managed Switches",sub:"Small business managed switches",bid:"$1",mkt:{new:"$500–$1,500",used:"$80–$300",ebay:"$80–$250"},notes:"Current-gen Cisco SMB switches. Newer and more accessible than Catalyst. Good for small business deployments.",verdict:"Bid $20–$60. Resell $80–$220 or deploy at client sites. Good managed switch for property mgmt environments.",roi:"3x–4x"},
  {v:"yay",cat:"Servers",name:"Dell PowerEdge R720 (x3)",sub:"Dual Xeon E5-2690 · 192GB ECC · 4TB+ SAS · 3 units",bid:"$1",mkt:{new:"$8,000+",used:"$300–$800",ebay:"$350–$700"},notes:"2012-era 2U servers but loaded — dual 8-core Xeons and 192GB ECC RAM is the highlight. 4TB SAS storage. Strong homelab/dev community buyer pool.",verdict:"Bid $50–$150 each. Resell $350–$650 to homelab/dev community. Or deploy in your own Proxmox expansion. 192GB ECC RAM = huge homelab value prop.",roi:"3x–5x"},
  {v:"yay",cat:"Servers",name:"Dell PowerEdge R710 (x5)",sub:"Dual Intel Xeon · 48–96GB ECC · SAS · 5 units",bid:"$1",mkt:{new:"$5,000+",used:"$100–$300",ebay:"$120–$250"},notes:"5 units across multiple lots. Still popular with homelab builders. 10GbE capable. Good for Proxmox, TrueNAS, storage builds. High power draw.",verdict:"Bid $30–$80 each. Resell $120–$220 to homelab community. Or integrate into Proxmox homelab expansion. Mention power draw in listings.",roi:"2x–4x"},
  {v:"yay",cat:"Servers",name:"Cisco UCS C220 M5 RackMount Server",sub:"Xeon Silver 4208 · 2.1GHz · 64GB ECC · No HDD",bid:"$1",mkt:{new:"$8,000+",used:"$800–$2,000",ebay:"$900–$1,800"},notes:"Recent Cisco UCS server. Silver 4208 8-core. 64GB ECC. No drives = buyer adds SSDs. Strong VMware/Cisco shop buyer pool.",verdict:"Bid $200–$500. Resell $900–$1,600 — set expectations on no drives. Or add 2x 1TB NVMe ($150) and push to $2,000. Excellent MSP homelab upgrade.",roi:"2x–4x at $300 bid + drives"},
  {v:"yay",cat:"Servers",name:"Tegile JBOD Storage Arrays",sub:"Multiple: Hybrid SSD · 16-SAS · 7.68TB SAS SSDs",bid:"$1",mkt:{new:"$15,000–$50,000",used:"$500–$5,000",ebay:"varies widely"},notes:"Enterprise storage arrays — Tegile acquired by WD. Value depends entirely on drives included. 7.68TB SAS SSDs alone = $300–$600 each. Check drive count carefully.",verdict:"Bid $50–$200 depending on drive count. VERIFY: 7.68TB SAS SSDs = major value. List drives separately if many included. Buyer pool: storage admins, lab builders.",roi:"3x–10x depending on drives"},
  {v:"yay",cat:"AV & Projectors",name:"Epson EB-L630U Laser Projector (x2)",sub:"Full HD · 6200 Lumens · 2 units",bid:"$1",mkt:{new:"$3,500–$4,000",used:"$800–$1,800",ebay:"$900–$1,400"},notes:"High-end laser projector — no lamp to replace, 20,000hr lifespan. 6200 lumens = bright conference rooms. Rare at surplus. Check laser module hours.",verdict:"Bid aggressively up to $400–$600 each. Resell $900–$1,200 each. Or offer as AV install to property mgmt client. Pair with GCT AV integration service.",roi:"2x–4x even at $400 bid"},
  {v:"meh",cat:"AV & Projectors",name:"Extron AV Equipment Lot",sub:"Video switchers / panels / amps / HDMI extenders",bid:"$1",mkt:{new:"$500–$5,000/unit",used:"varies",ebay:"$50–$800/piece"},notes:"Extron = industry standard for AV integration. Lot value depends on what's included — check model numbers. One mid-range switcher = $300–$500.",verdict:"Bid $50–$200 for the lot. Identify individual models — resell separately. One DXP or CrossPoint switcher = $300–$800. Excellent GCT AV service tie-in.",roi:"Unknown but likely 3x–5x"},
  {v:"meh",cat:"AV & Projectors",name:"Polycom / Sampo 50\" Conference Screen",sub:"50\" display for video conferencing",bid:"$1",mkt:{new:"$800+",used:"$100–$300",ebay:"$80–$250"},notes:"Conference room AV display. 50\" is reasonable for conference rooms. Polycom brand = trusted. Good bundle with Extron AV lot.",verdict:"Bid $20–$50. Resell $100–$200 to conference room buyers. Or use in a property mgmt meeting room. Bundle with Extron AV lot.",roi:"3x–4x"},
  {v:"yay",cat:"3D Printers",name:"Formlabs Form 3+ SLA Resin Printer",sub:"Desktop resin 3D printer",bid:"$1",mkt:{new:"$3,499",used:"$1,200–$2,500",ebay:"$1,000–$2,200"},notes:"Formlabs = market leader in desktop SLA. Form 3+ = current generation. High demand from engineers, dental labs, jewelry makers. Check resin tank and build platform condition.",verdict:"Bid $200–$500. Resell $1,000–$2,000 on eBay. Or offer to local maker/engineering firm. Verify tank + resin cartridge included.",roi:"3x–6x"},
  {v:"meh",cat:"3D Printers",name:"Creality Ender-3 Max Neo & Ender-3",sub:"2 FDM 3D printers",bid:"$1",mkt:{new:"$250–$350",used:"$80–$180",ebay:"$80–$160"},notes:"Ender-3 is most-sold consumer 3D printer ever. Large buyer pool — makers, hobbyists, educators. Check bed condition and extruder.",verdict:"Bid $15–$40 each. Resell $80–$150 easily on eBay or FB. Low risk, decent margin.",roi:"3x–4x"},
  {v:"meh",cat:"3D Printers",name:"Dremel 3D Digilab 3D45",sub:"Enclosed FDM printer · Nylon/ABS capable",bid:"$1",mkt:{new:"$1,200",used:"$200–$450",ebay:"$180–$380"},notes:"Higher-end Dremel FDM printer — enclosed, supports Nylon/ABS. Safer for office use. Strong brand recognition.",verdict:"Bid $40–$80. Resell $180–$350. Enclosed = premium listing point. Check filament type and availability.",roi:"3x–4x"},
  {v:"yay",cat:"Tablets & iPads",name:"Apple iPad 7th Gen 10.2\" (2020)",sub:"128GB WiFi A2197 · 2020 · iPadOS 17+ capable",bid:"$1",mkt:{new:"$429",used:"$100–$180",ebay:"$110–$160"},notes:"Most recent iPad in catalog — 2020, 128GB, fully supported on iPadOS 17+. Best iPad here. Entry-level but very capable.",verdict:"Bid $50–$80. Best iPad in the catalog — still fully supported. Resell $130–$165 on eBay easily. Or keep as GCT field tablet for client visits.",roi:"2x–3x"},
  {v:"meh",cat:"Tablets & iPads",name:"Apple iPad Pro 12.9\" (1st & 2nd Gen)",sub:"32GB & 64GB WiFi · A1584 · 2015–2017",bid:"$1",mkt:{new:"$1,099 (era)",used:"$200–$400",ebay:"$180–$350"},notes:"12.9\" Pro — multiple units. 1st gen (A1584) iOS maxes at 16. 2nd gen slightly better. Good for display/kiosk/presentation.",verdict:"Bid $30–$60 each depending on gen. 1st gen: lower value, iOS stuck. 2nd gen: slightly better. Good lobby kiosk or media player use.",roi:"3x–5x at low bids"},
  {v:"meh",cat:"Tablets & iPads",name:"Apple iPad Pro 9.7\" (various)",sub:"32GB & 256GB WiFi A1673 · 2 variants",bid:"$1",mkt:{new:"$599 (era)",used:"$100–$200",ebay:"$100–$180"},notes:"9.7\" Pro — 256GB variant is the strong one. Max iOS 16. Apple Pencil 1st gen compatible.",verdict:"Bid $25–$50 for 32GB, $60–$90 for 256GB. 256GB commands significant premium. Resell $140–$180 for 256GB. Good field work device.",roi:"2x–3x"},
  {v:"meh",cat:"Tablets & iPads",name:"Apple iPad Air (1st & 2nd Gen)",sub:"Air 32GB WiFi 2016 · Air 2 64GB WiFi 2017",bid:"$1",mkt:{new:"$499 (era)",used:"$60–$130",ebay:"$70–$120"},notes:"Older iPads — max iOS 15–16. Limited app support. Good single-purpose use: kiosk, display, student device.",verdict:"Bid $10–$30 each. iOS limitation kills general consumer appeal. Best: kiosk, lobby display, kids device. Resell $60–$110 on eBay or local FB Marketplace.",roi:"3x–5x at $15 bid"},
  {v:"yay",cat:"UPS & Power",name:"APC Smart-UPS SRT 5000 (x3)",sub:"3 units · 5kVA each",bid:"$1",mkt:{new:"$4,500",used:"$400–$1,200",ebay:"$350–$1,000"},notes:"3 units of enterprise UPS — APC SRT = best-in-class rack UPS. Batteries will need replacement ($200–$400 each) but units are highly sought for server rooms.",verdict:"Bid $50–$150 each. Budget $250/unit for battery replacement. Resell $500–$900 refurbed. Or deploy at a client server room.",roi:"3x–4x after batteries"},
  {v:"yay",cat:"UPS & Power",name:"APC RackMount UPS Systems (x8)",sub:"8 units · various sizes",bid:"$1",mkt:{new:"$1,000–$2,000",used:"$100–$400",ebay:"$100–$350"},notes:"8 units of rack UPS — large lot. Batteries likely dead but chassis/electronics often fine. High demand for server room / network closet protection.",verdict:"Bid $20–$60 each. Budget for battery replacements. Resell $150–$350 each after refurb. Or deploy across multiple client server rooms.",roi:"2x–4x after batteries"},
  {v:"meh",cat:"Chromebooks",name:"50pcs Dell Chromebook 11 5190",sub:"Celeron N3350 · 4GB · 32GB · ChromeOS",bid:"$1",mkt:{new:"$300",used:"$30–$80",ebay:"$30–$60"},notes:"50 Chromebooks. AUE (Auto Update Expiry) is critical — N3350 units may be AUE 2025/2026. If expired, ChromeOS won't update. Still usable for basic browsing.",verdict:"Bid $5–$15 each. VERIFY AUE DATE first at chromeosupdates.appspot.com. If good: resell $35–$55 each = $1,750–$2,750 for 50. Logistics: 50 units = van needed.",roi:"3x–5x if AUE is valid"},
  {v:"meh",cat:"Chromebooks",name:"50pcs Dell Chromebook 3100",sub:"Celeron N4000 · 4GB · 32GB · ChromeOS",bid:"$1",mkt:{new:"$350",used:"$40–$90",ebay:"$40–$75"},notes:"Newer than 5190. N4000 slightly better. AUE typically 2026–2028 depending on year. Better resale ceiling.",verdict:"Same approach: verify AUE first. 50 units — major logistics. If AUE good: $45–$70 each = $2,250–$3,500. Consider bulk sale to school district.",roi:"3x–5x if AUE is good"},
  {v:"yay",cat:"Printers & Scanners",name:"HP DesignJet T1700 Plotter 44\"",sub:"Large format plotter · 44\" wide",bid:"$1",mkt:{new:"$3,000–$4,000",used:"$800–$2,000",ebay:"$700–$1,800"},notes:"Professional large-format plotter — architects, engineers, sign shops. HP DesignJet = industry standard. Check ink cartridge status. Big item = local pickup only.",verdict:"Bid $150–$400. Local-only sale (large/heavy). Resell $700–$1,500 to architecture/engineering firm. Or offer to a local print shop.",roi:"3x–5x"},
  {v:"meh",cat:"Printers & Scanners",name:"HP Scanjet N9120 Document Scanner",sub:"Enterprise flatbed scanner",bid:"$1",mkt:{new:"$2,500",used:"$200–$600",ebay:"$150–$500"},notes:"Enterprise document scanner for legal/HR. Flatbed + ADF. HP brand = easy sell. Could support GCT document digitizing service.",verdict:"Bid $30–$80. Resell $150–$400. Or offer to property mgmt client for digitizing docs. Good tie-in to GCT document scanning service.",roi:"3x–5x"},
  {v:"meh",cat:"Printers & Scanners",name:"Fujitsu ScanSnap S1500 & S1500M",sub:"2 USB document scanners",bid:"$1",mkt:{new:"$500",used:"$60–$150",ebay:"$60–$130"},notes:"Popular desktop document scanners. S1500M = Mac version. ScanSnap is preferred brand for small business doc digitizing. Complements photo digitizing service line.",verdict:"Bid $10–$30 each. Resell $60–$120 each on eBay. Or add to GCT document scanning service line. S1500M Mac version = slightly higher value.",roi:"3x–5x"},
  {v:"nay",cat:"Printers & Scanners",name:"Dell B1260dn Mono Laser Printer",sub:"EOL monochrome network laser",bid:"$1",mkt:{new:"$200 (era)",used:"$15–$45",ebay:"$15–$35"},notes:"EOL Dell printer (Samsung OEM). No Win 11 driver via Windows Update. Proprietary toner. Low resale demand.",verdict:"Pass. Win 11 driver issues = client support headache. Toner costs more than resale value. Not worth GCT time.",roi:"N/A — pass"},
  {v:"nay",cat:"Printers & Scanners",name:"Xerox Phaser 6510 Color Laser",sub:"Known fuser issues",bid:"$1",mkt:{new:"$350 (era)",used:"$40–$100",ebay:"$50–$80"},notes:"Known fuser issues. 4-color toner set = $80–$120 to replace. Low margin, high support risk.",verdict:"Pass. Fuser failure = common expensive repair. Toner replacement kills margin. Not GCT core. Only if confirmed working + toner included.",roi:"N/A — pass"},
  {v:"nay",cat:"Displays & TVs",name:"Samsung UN32N5300 Smart TV (x9–10)",sub:"32\" Full HD · No stand · 9–10 units",bid:"$1",mkt:{new:"$220",used:"$40–$90",ebay:"$50–$80"},notes:"No stand is a deal-killer. 32\" = worst resale TV size. 10 units = too much dead inventory. Tizen app support aging.",verdict:"Hard pass on bulk. No stand kills usability and resale. 32\" hardest TV size to move. 10 units = storage nightmare. At most 1 unit at $5 for internal use.",roi:"N/A — pass"},
  {v:"nay",cat:"Displays & TVs",name:"Samsung LN32D430 32\" LCD",sub:"720p LCD · No smart features · 2011 era",bid:"$1",mkt:{new:"discontinued",used:"$20–$50",ebay:"$20–$40"},notes:"Old 2011-era LCD, no smart features, likely 720p. Zero deployment value in 2024.",verdict:"Pass. Sub-$40 resale ceiling. No smart features, aging panel. $1 bid only if needed as a wall-display monitor in a pinch.",roi:"N/A — pass"},
  {v:"nay",cat:"Misc / Skip",name:"Code Blue Emergency Phones (PARTS)",sub:"3 units · Parts only",bid:"$1",mkt:{new:"$600–$2,000",used:"$20–$80 (parts)",ebay:"very limited"},notes:"Campus emergency call boxes — sold as parts only. Zero deployment value. Buyer pool essentially nonexistent for GCT.",verdict:"Hard pass. Parts only = not deployable. Near-zero resale market.",roi:"N/A — pass"},
  {v:"nay",cat:"Misc / Skip",name:"3pcs Cisco IP Phone 8861 (PARTS)",sub:"Parts only",bid:"$1",mkt:{new:"$350",used:"$40–$100 working",ebay:"$10–$40 parts"},notes:"PARTS designation = cannot be resold as working phones. Cisco 8861 is great but not as parts.",verdict:"Pass. Parts only = essentially scrap. Not worth bid or logistics.",roi:"N/A — pass"},
  {v:"nay",cat:"Misc / Skip",name:"Sony Blu-Ray Players (BDP-S1100 & S3500)",sub:"3 units total",bid:"$1",mkt:{new:"$80–$100",used:"$10–$40",ebay:"$10–$35"},notes:"Streaming has killed this market. No GCT use case whatsoever.",verdict:"Pass. Dead category — streaming killed it. Sub-$35 resale ceiling. Not worth GCT time.",roi:"N/A — pass"},
  {v:"nay",cat:"Misc / Skip",name:"Memorex MVD2022 DVD Player",sub:"Basic DVD player",bid:"$1",mkt:{new:"$30",used:"$5–$15",ebay:"$5–$10"},notes:"Negligible value. Complete pass.",verdict:"Pass. Under $10 resale — not worth time.",roi:"N/A — pass"},
  {v:"meh",cat:"Misc / Skip",name:"JBL JRX212 Passive PA Speakers (x2)",sub:"Passive loudspeakers · Need amp",bid:"$1",mkt:{new:"$600/pair",used:"$150–$350/pair",ebay:"$150–$300 pair"},notes:"Pro audio PA speakers. Passive = needs amp. Good resale to DJ/church/event community. Relevant to PIKARÓN music background.",verdict:"Bid $20–$60 for the pair. Check cone condition. Resell $150–$280. Or keep for PIKARÓN event use.",roi:"3x–5x"},
  {v:"meh",cat:"Misc / Skip",name:"Dell Thunderbolt Dock TB16",sub:"130W · Thunderbolt 3 dock",bid:"$1",mkt:{new:"$300",used:"$40–$100",ebay:"$40–$90"},notes:"Compatible with specific Dell Latitude TB3 laptops. If buying TB3 Latitudes, this is a useful addition.",verdict:"Bid $10–$25. Only useful with TB3 Dell laptops. Bundle with Latitude lots for higher total value. Resell $40–$80.",roi:"2x–4x"},
  {v:"meh",cat:"Misc / Skip",name:"APC NetShelter Rack Cable Tray (x2)",sub:"Rackmount cable management",bid:"$1",mkt:{new:"$200",used:"$30–$80",ebay:"$25–$60"},notes:"Rackmount cable management accessories. Useful if buying servers/switches. Otherwise limited.",verdict:"Bid $5–$20 only if buying servers. Bundle with server lots. Resell $30–$60 otherwise.",roi:"2x–3x if bundled"},
  {v:"yay",cat:"Power Supplies & Chargers",name:"25pcs Dell 45W USB-C Power Supplies (x2 lots)",sub:"50 total units · NEW",bid:"$1",mkt:{new:"$45/ea",used:"$10–$25",ebay:"$12–$22"},notes:"50 total USB-C Dell chargers across two lots. Compatible with Dell Latitude USB-C laptops (in this auction). Bundle opportunity with laptops.",verdict:"Bid $20–$50 per 25-unit lot. Bundle with Latitude laptop lots. Or resell $12–$20 each. 50 units at $15 avg = $750 on a $100 lot bid.",roi:"4x–7x per lot"},
  {v:"yay",cat:"Power Supplies & Chargers",name:"31pcs Dell 65W Laptop Adapters (NEW)",sub:"G4X7T · 31 units · NEW sealed",bid:"$1",mkt:{new:"$50/ea",used:"$12–$25",ebay:"$12–$22"},notes:"31 new Dell laptop chargers. Sealed/new condition = premium. Bundle with laptops or sell individually.",verdict:"Bid $30–$60. 31 new units at $15 avg = $465 minimum return. Bundle with laptop lots. Great accessory upsell.",roi:"4x–6x"},
  {v:"nay",cat:"Power Supplies & Chargers",name:"Apple USB Chargers (A1357 / A1401)",sub:"10W & 12W USB chargers · Multiple",bid:"$1",mkt:{new:"$19–$29",used:"$5–$12",ebay:"$3–$8"},notes:"Old Apple USB chargers. Low value, high competition on eBay.",verdict:"Pass. Under $10 resale ceiling — not worth GCT time.",roi:"N/A — pass"},
  {v:"meh",cat:"Misc / Skip",name:"Avocent Switchview SC380 8-Port KVM",sub:"Secure KVM switch",bid:"$1",mkt:{new:"$800–$1,200",used:"$150–$400",ebay:"$120–$350"},notes:"Government/compliance-grade KVM. Used in secure facilities (DoD, finance, healthcare). Niche but strong resale.",verdict:"Bid $20–$50. Niche buyer pool but high value to right buyer. Resell $150–$300 to IT/gov buyers.",roi:"3x–6x"},
  {v:"meh",cat:"Misc / Skip",name:"Barracuda Message Archiver 850",sub:"Email archive appliance",bid:"$1",mkt:{new:"$5,000+",used:"$100–$500",ebay:"$50–$300"},notes:"Email archiving appliance — subscription-dependent. Hardware alone limited without Barracuda subscription.",verdict:"Bid $5–$20. Without subscription = parts or lab only. Not client-deployable without ongoing sub.",roi:"Low — parts/lab"},
  {v:"meh",cat:"Misc / Skip",name:"Dake 909215 25-ton Shop Press",sub:"Electrically operated H-frame",bid:"$1",mkt:{new:"$1,500–$2,000",used:"$400–$800",ebay:"$350–$700"},notes:"Industrial shop press — not IT at all. Resells well to auto shops, machine shops. Local buyers only (heavy).",verdict:"Bid $50–$150 if you can move it. Local FB Marketplace / industrial buyers. Not GCT core — opportunistic only.",roi:"3x–5x local"},
  {v:"nay",cat:"Misc / Skip",name:"Laptop / Tablet Sleeves (80+ units)",sub:"BagSmart, Naukay, Caselogic, HP, unbranded",bid:"$1",mkt:{new:"$15–$30",used:"$3–$10",ebay:"$3–$8"},notes:"Dozens of laptop sleeves across many lots. Very low individual value.",verdict:"Pass. Sub-$10 each — not worth individual time. Only take if bundled free with laptop lots.",roi:"N/A — accessories only"},
  {v:"nay",cat:"Misc / Skip",name:"Mixed USB / DisplayPort Cables (bulk)",sub:"15pcs DP-DVI · 30pcs DP-DP · 40pcs USB · 10pcs HDMI",bid:"$1",mkt:{new:"$5–$15/cable",used:"$1–$5",ebay:"$1–$4"},notes:"Cables in bulk. Very low margin per item.",verdict:"Pass. Low value individually. Only take if thrown in free with major lots. No standalone GCT priority.",roi:"N/A — accessories only"},
];

function prepFor(cat, name) {
  const n = (name || "").toLowerCase();
  // Bulk lots (cables, sleeves, chargers) → $10
  if (cat === "Power Supplies & Chargers") return 10;
  if (/sleeve|cables/.test(n)) return 10;
  switch (cat) {
    case "Laptops/MacBooks":
    case "Desktops & AIOs":
      return 40; // laptops, MacBooks, mini PCs, AIOs, desktops
    case "Networking":
    case "Servers":
      return 0;
    case "3D Printers":
      return 25;
    case "Tablets & iPads":
      return 20;
    case "UPS & Power":
      return 50; // budget for likely battery replacement
    case "Chromebooks":
      return 20;
    case "Printers & Scanners":
      return 15;
    default:
      return 25; // AV, Displays, Misc, everything else
  }
}

const ITEMS = RAW_ITEMS.map((it) => ({ ...it, prep: prepFor(it.cat, it.name) }));

const CATS = ["All", ...Array.from(new Set(ITEMS.map(i => i.cat)))];
const VERDICTS = { yay: "GCT Yay", nay: "Pass", meh: "Conditional" };

const BADGE_STYLES = {
  yay: { bg: "#E1F5EE", color: "#0F6E56", label: "GCT Yay" },
  nay: { bg: "#FCEBEB", color: "#A32D2D", label: "Pass" },
  meh: { bg: "#FAEEDA", color: "#854F0B", label: "Conditional" },
};

const EBAY_FEE_RATE = 0.13;          // eBay seller fee ~13%
const EBAY_NET = 1 - EBAY_FEE_RATE;  // 0.87 of sale price after eBay fees
const ROI_FLOOR = 2;                 // default ROI target (2x return) on open
const ROI_MIN = 1;                   // slider lower bound (1x = break-even)
const ROI_MAX = 10;                  // slider upper bound (10x)
const ROI_STEP = 0.5;                // slider granularity
const AUCTION_FEE_MULT = 1.2714;     // 1.18 internet premium × 1.0775 sales tax
const CASH_BID_MULT = 1.0247;        // bump when paying cash (3% buyer's-premium discount)

function parseEbayLow(ebay) {
  if (!ebay) return 0;
  const m = String(ebay).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

function bidMath(item, roi = ROI_FLOOR) {
  const ebayLow = parseEbayLow(item.mkt && item.mkt.ebay);
  const prep = typeof item.prep === "number" ? item.prep : 25;
  const ebayFees = ebayLow * EBAY_FEE_RATE;
  const netAfterCosts = ebayLow * EBAY_NET - prep;
  const afterRoi = netAfterCosts / roi;
  const afterAuctionFees = afterRoi / AUCTION_FEE_MULT;
  const maxBid = Math.max(1, Math.floor(afterAuctionFees));
  const trueCostAtMax = maxBid * AUCTION_FEE_MULT;
  const returnAtMax = netAfterCosts;
  const roiAtMax = trueCostAtMax > 0 ? returnAtMax / trueCostAtMax : 0;
  return { ebayLow, prep, ebayFees, netAfterCosts, afterRoi, afterAuctionFees, maxBid, trueCostAtMax, returnAtMax, roiAtMax };
}

function calcMaxBid(item, roi) {
  return bidMath(item, roi).maxBid;
}

function money(n) {
  if (!isFinite(n)) return "0";
  const v = Math.round(n * 100) / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
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

export default function App() {
  const [filter, setFilter] = useState("all");
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [sort, setSort] = useState("none");
  const [roi, setRoi] = useState(ROI_FLOOR);

  const filtered = useMemo(() => {
    const result = ITEMS.filter(item => {
      if (filter !== "all" && item.v !== filter) return false;
      if (cat !== "All" && item.cat !== cat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(item.name + " " + item.sub + " " + item.cat).toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sort === "asc" || sort === "desc") {
      return [...result].sort((a, b) => {
        const diff = calcMaxBid(a, roi) - calcMaxBid(b, roi);
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

  const toggleExpand = (idx) => setExpanded(expanded === idx ? null : idx);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto", padding: "24px 16px", color: "#1a1a1a" }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>SD Surplus Auctions · June 25</div>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>GCT Auction Buy Analysis</h1>
        <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>355 items · 157-page catalog · All bids start at $1 · Closes June 25 on Proxibid</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Total lots analyzed" value="80+" sub="Unique categories" />
        <StatCard label="GCT Yay picks" value={counts.yay} sub="High priority buys" />
        <StatCard label="Conditional" value={counts.meh} sub="Depends on condition/price" />
        <StatCard label="Pass / Skip" value={counts.nay} sub="Not worth GCT time" />
        <StatCard label="Closes" value="Jun 25" sub="Proxibid online" />
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
          <option value="none">Sort: Original order</option>
          <option value="desc">Max bid ↓ (highest)</option>
          <option value="asc">Max bid ↑ (lowest)</option>
        </select>
        <input
          type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
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
          <span style={{ fontSize: 24, fontWeight: 600, color: "#c07700", lineHeight: 1.1 }}>{roi.toFixed(1)}x</span>
        </div>
        <div style={{ flex: "1 1 240px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#bbb" }}>{ROI_MIN.toFixed(1)}x</span>
          <input
            type="range"
            min={ROI_MIN} max={ROI_MAX} step={ROI_STEP} value={roi}
            onChange={e => setRoi(parseFloat(e.target.value))}
            aria-label="ROI target multiplier"
            style={{ flex: 1, accentColor: "#c07700", cursor: "pointer" }}
          />
          <span style={{ fontSize: 11, color: "#bbb" }}>{ROI_MAX.toFixed(1)}x</span>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", flex: "1 1 100%", maxWidth: 360 }}>
          Drag to set your required return. Higher ROI → lower max bids. Every bid calculation updates live.
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
        Showing {filtered.length} of {ITEMS.length} items · Click any row to expand details
      </div>

      <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 14 }}>No items match your filters.</div>
        ) : filtered.map((item, idx) => {
          const isOpen = expanded === idx;
          const bm = bidMath(item, roi);
          return (
            <div key={idx} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <div
                onClick={() => toggleExpand(idx)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto auto auto",
                  gap: 12, alignItems: "center", padding: "12px 16px",
                  cursor: "pointer", background: isOpen ? "#fafafa" : "#fff",
                  transition: "background 0.1s"
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "#1a1a1a" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item.sub}</div>
                  <div style={{ marginTop: 5 }}><Badge v={item.v} /></div>
                </div>
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>eBay used</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{item.mkt.ebay}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 70 }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    <span className="maxbid-label-full">Max bid</span>
                    <span className="maxbid-label-short">Max</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#c07700" }}>${bm.maxBid}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: "#aaa" }}>Est. ROI</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: item.v === "yay" ? "#1D9E75" : item.v === "nay" ? "#c0392b" : "#c07700" }}>{item.roi}</div>
                </div>
                <div style={{ fontSize: 18, color: "#bbb", width: 20, textAlign: "center" }}>
                  {isOpen ? "▲" : "▼"}
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px 16px", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
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
                        {bm.ebayLow > 0 ? (
                          <>
                            <BidRow label="eBay low" value={`$${money(bm.ebayLow)}`} />
                            <BidRow label="− eBay fees (13%)" value={`−$${money(bm.ebayFees)}`} />
                            <BidRow label="− Prep cost" value={`−$${money(bm.prep)}`} />
                            <BidRow label="= Net after costs" value={`$${money(bm.netAfterCosts)}`} />
                            <BidRow label={`÷ ${roi.toFixed(1)}x ROI target`} value={`$${money(bm.afterRoi)}`} />
                            <BidRow label="÷ Auction fees" value={`$${money(bm.afterAuctionFees)}`} />
                            <div style={{ borderTop: "1px solid #e5e5e5", margin: "6px 0" }} />
                            <BidRow label="Max bid" value={`$${bm.maxBid}`} strong />
                            <BidRow label="True cost at max" value={`$${money(bm.trueCostAtMax)}`} />
                            <BidRow label="Return at max" value={`$${money(bm.returnAtMax)}`} />
                            <BidRow label="ROI at max bid" value={`${bm.roiAtMax.toFixed(2)}x`} />
                          </>
                        ) : (
                          <div style={{ color: "#888" }}>
                            No parseable eBay range (“{item.mkt.ebay}”). Max bid falls to the <strong style={{ color: "#c07700" }}>$1</strong> floor — value depends on contents; inspect before bidding.
                          </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: 11, color: "#aaa" }}>
                          Paying cash? Max bid × {CASH_BID_MULT} = <strong style={{ color: "#c07700" }}>${Math.max(1, Math.floor(bm.maxBid * CASH_BID_MULT))}</strong> (3% cash discount).
                        </div>
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
        Market values estimated from eBay sold listings & surplus pricing, Jun 2026. Final auction prices will vary. Bid at your own discretion.
      </p>
    </div>
  );
}
