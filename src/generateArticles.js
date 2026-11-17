// Sample-content generator for the prototype.
// Produces deterministic (seeded) headlines + descriptions spread over ~3 years so the
// paginator and every filter have enough material to play with.
// ⚠️ All articles are fictional sample copy; company names are real, events and figures are invented,
// and acquisition targets are made-up companies.

const SOURCES = [
  { name: 'Bloomberg', w: 22, media: 0.8 },
  { name: 'The Wall Street Journal', w: 20, media: 0.85 },
  { name: 'Example Inc. Newswires', w: 17, media: 0.35 },
  { name: 'Reuters', w: 17, media: 0.3 },
  { name: 'Financial Times', w: 10, media: 0.85 },
  { name: 'Apple Daily Taiwan (Chinese language translation)', w: 5, media: 0.3, language: 'Chinese', region: 'Asia Pacific' },
  { name: 'Les Echos (French language translation)', w: 3, media: 0.6, language: 'French', region: 'Europe' },
  { name: 'Handelsblatt (German language translation)', w: 3, media: 0.6, language: 'German', region: 'Europe' },
  { name: 'Expansión (Spanish language translation)', w: 3, media: 0.5, language: 'Spanish', region: 'South America' },
]

const REGIONS = [
  { name: 'North America', w: 45 },
  { name: 'Europe', w: 20 },
  { name: 'Asia Pacific', w: 20 },
  { name: 'South America', w: 7 },
  { name: 'Middle East', w: 8 },
]

const COMPANIES = [
  {
    w: 20, n: 'Apple', full: 'Apple Inc.', industries: ['Technology', 'Consumer Electronics'], rev: [78, 130],
    products: ['iPhone 17', 'Apple Watch Series 11', 'MacBook Air M5', 'iPad Pro', 'AirPods Pro 4', 'HomePod Display', 'Vision Air', 'Apple Intelligence Studio'],
    drivers: ['iPhone', 'services', 'wearables', 'spatial computing'], segments: ['Services', 'Wearables', 'Mac', 'iPhone'],
  },
  {
    w: 20, n: 'Google', full: 'Alphabet Inc.', industries: ['Technology'], rev: [68, 100],
    products: ['Gemini 2.5', 'Pixel 11', 'Android XR glasses', 'Chronicle SecOps', 'Workspace AI Suite', 'Gemini Nano', 'Maps Live View'],
    drivers: ['cloud', 'search advertising', 'AI models', 'YouTube'], segments: ['Google Cloud', 'Search', 'YouTube', 'Devices'],
  },
  {
    w: 15, n: 'Microsoft', full: 'Microsoft Corp.', industries: ['Technology'], rev: [55, 82],
    products: ['Copilot Studio', 'Surface Laptop 8', 'Azure AI Foundry', 'Xbox Cloud Edition', 'Dynamics 365 Agents', 'Windows 12 preview'],
    drivers: ['Azure cloud', 'productivity software', 'gaming', 'enterprise AI'], segments: ['Azure', 'Office', 'Gaming', 'LinkedIn'],
  },
  {
    w: 13, n: 'Tesla', full: 'Tesla Inc.', industries: ['Energy', 'Automotive'], rev: [22, 30],
    products: ['Model Y refresh', 'Megapack 3', 'Powerwall 4', 'Cybercab', 'Full Self-Driving v14', 'Supercharger V5'],
    drivers: ['vehicle deliveries', 'energy storage', 'autonomy software', 'charging'], segments: ['Automotive', 'Energy Storage', 'Services'],
  },
  {
    w: 13, n: 'Amazon', full: 'Amazon.com Inc.', industries: ['Retail', 'Technology'], rev: [135, 190],
    products: ['Alexa+ Home', 'Kuiper terminals', 'AWS Trainium 3', 'Prime Air drones', 'Kindle Scribe 3', 'Bedrock Agents'],
    drivers: ['AWS cloud', 'e-commerce', 'advertising', 'logistics'], segments: ['AWS', 'North America retail', 'Advertising', 'International'],
  },
  {
    w: 9, n: 'Ford', full: 'Ford Motor Company', industries: ['Automotive', 'Energy'], rev: [40, 48],
    products: ['F-150 Lightning refresh', 'Mustang Mach-E Premium', 'BlueCruise 2.0', 'Explorer Hybrid', 'Transit Electric', 'Ford Pro Telematics'],
    drivers: ['electric vehicles', 'trucks', 'commercial fleets', 'hybrids'], segments: ['Ford Blue', 'Model e', 'Ford Pro'],
  },
  {
    w: 10, n: 'NVIDIA', full: 'NVIDIA Corporation', industries: ['Technology'], rev: [24, 70],
    products: ['Blackwell Ultra', 'Rubin platform', 'GeForce RTX 60 series', 'DRIVE Thor', 'Jetson Orin Nano', 'DGX Cloud Lepton'],
    drivers: ['data-center GPUs', 'AI accelerators', 'gaming graphics', 'automotive AI'], segments: ['Data Center', 'Gaming', 'Professional Visualization', 'Automotive'],
  },
]

const SUBJECTS = [
  { name: 'Earnings', w: 20, topic: 'Earnings' },
  { name: 'Product Launches', w: 25, topic: 'Products' },
  { name: 'Markets', w: 15, topic: 'Markets' },
  { name: 'Regulation', w: 10, topic: 'Policy' },
  { name: 'Mergers & Acquisitions', w: 8, topic: 'Deals' },
  { name: 'Sustainability', w: 10, topic: 'Sustainability' },
  { name: 'Cybersecurity', w: 12, topic: 'Security' },
]

const PARTNERS = [
  'Northwind Robotics', 'Lumen Dynamics', 'Quartzline Analytics', 'Bluefen Health', 'Harbor Grid Systems',
  'Altamira Semiconductors', 'Kestrel Security', 'Meridian Pay', 'Orbital Freight Labs', 'Sparrowhawk AI',
  'Tidepool Energy', 'Vantage Cloud Networks', 'Fernhill Genomics', 'Cobalt Mobility', 'Ironbark Data',
]

const THREATS = ['phishing campaigns', 'ransomware attacks', 'supply-chain vulnerabilities', 'credential-stuffing attempts', 'zero-day exploits']

// Region label as it reads inside a sentence
const REGION_PHRASE = {
  'North America': 'North America',
  Europe: 'Europe',
  'Asia Pacific': 'Asia-Pacific',
  'South America': 'Latin America',
  'Middle East': 'the Middle East',
}

// ---- seeded random --------------------------------------------------------
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- headline / description templates ------------------------------------
// each takes a context `x` and returns [title, description]
const TEMPLATES = {
  Earnings: [
    (x) => [
      `${x.n} Revenue Rises ${x.pct}% in ${x.q} as ${x.driver} Demand Strengthens`,
      `${x.full} reported ${x.q} revenue of $${x.bn} billion, up ${x.pct}% from a year earlier, as demand for ${x.driver} outpaced analyst expectations. Management raised its full-year outlook and pointed to continued strength in ${x.segment}, while cautioning that currency swings could weigh on the second half.`,
    ],
    (x) => [
      `${x.n} Profit Tops Forecasts After ${x.q} Results`,
      `Net income at ${x.full} reached $${x.ni} billion in ${x.q}, beating consensus estimates by ${x.pct2}%. Investors focused on margins and guidance, with executives signalling continued investment in ${x.driver} through the next fiscal year.`,
    ],
    (x) => [
      `${x.n} Posts Record ${x.q} Sales on ${x.driver} Momentum`,
      `${x.n} closed the quarter with sales of $${x.bn} billion, a company record, as ${x.segment} grew ${x.pct}% year over year. Executives told analysts that order books remain healthy, although supply constraints could limit upside in coming months.`,
    ],
    (x) => [
      `${x.n} Trims Costs as ${x.q} Earnings Show Slower ${x.segment} Growth`,
      `${x.full} said ${x.segment} growth slowed to ${x.pct3}% in ${x.q}, prompting a new round of cost discipline. Revenue totalled $${x.bn} billion, and the company reiterated that it expects momentum in ${x.driver} to improve later in the year.`,
    ],
  ],
  'Product Launches': [
    (x) => [
      `${x.n} Unveils ${x.prod}, Expanding Its ${x.driver} Lineup`,
      `${x.full} has introduced ${x.prod}, positioning the product as a centrepiece of its ${x.driver} strategy. The launch brings faster performance, better energy efficiency and tighter integration with the company's existing services, with availability starting in ${x.reg} before a wider rollout.`,
    ],
    (x) => [
      `${x.n} Launches ${x.prod} in ${x.reg} Ahead of Schedule`,
      `${x.n} began shipping ${x.prod} to customers in ${x.reg} weeks earlier than planned, citing strong pre-orders and a smoother supply chain. Early reviews highlight the product's performance gains, while analysts say pricing will be key to adoption.`,
    ],
    (x) => [
      `First Look: ${x.prod} Gives ${x.n} a New Edge in ${x.driver}`,
      `Hands-on testing of ${x.prod} shows meaningful improvements over its predecessor, particularly in speed and reliability. ${x.full} says the release is part of a broader push in ${x.driver}, with additional features planned for later software updates.`,
    ],
    (x) => [
      `${x.n} Opens Pre-Orders for ${x.prod} as Demand Builds`,
      `Pre-orders for ${x.prod} opened this week, with ${x.full} reporting strong early interest from consumers and enterprise buyers in ${x.reg}. The company expects ${x.segment} to benefit as the product reaches more markets over the coming quarter.`,
    ],
  ],
  Regulation: [
    (x) => [
      `${x.n} Faces New Scrutiny From ${x.Reg} Regulators Over ${x.driver}`,
      `Regulators in ${x.reg} have opened a review of ${x.full}'s ${x.driver} business, requesting information on pricing, competition and consumer protections. The company said it is cooperating fully and expects the process to take several months.`,
    ],
    (x) => [
      `${x.n} Welcomes Clarity as ${x.Reg} Finalises Rules for ${x.driver}`,
      `New rules governing ${x.driver} in ${x.reg} take effect next year, setting out transparency and safety requirements for large providers. ${x.full} said it supports clear standards and is adjusting its compliance programmes in ${x.segment}.`,
    ],
    (x) => [
      `${x.n} Wins Approval to Expand ${x.segment} Operations in ${x.Reg}`,
      `${x.full} has received regulatory approval to broaden its ${x.segment} operations in ${x.reg}, clearing a key hurdle for planned investment. The decision follows months of consultation and is expected to support local hiring and infrastructure.`,
    ],
    (x) => [
      `Policy Shift in ${x.Reg} Could Reshape ${x.n}'s ${x.driver} Plans`,
      `Proposed legislation in ${x.reg} would tighten requirements for companies active in ${x.driver}, and analysts say ${x.full} may need to adapt its product roadmap. The company declined to comment on specific provisions but said it would engage with policymakers.`,
    ],
  ],
  'Mergers & Acquisitions': [
    (x) => [
      `${x.n} Agrees to Acquire ${x.partner} in $${x.deal} Billion Deal`,
      `${x.full} has agreed to acquire ${x.partner}, a specialist in ${x.driver}, for about $${x.deal} billion in cash and stock. The transaction, which is subject to regulatory approval, is expected to close within twelve months and strengthen ${x.segment}.`,
    ],
    (x) => [
      `${x.n} Weighs Partnership With ${x.partner} to Scale ${x.driver}`,
      `${x.full} is in talks with ${x.partner} on a strategic partnership aimed at scaling ${x.driver}, according to people familiar with the matter. Discussions are at an early stage and no final agreement has been reached.`,
    ],
    (x) => [
      `${x.n} Completes Purchase of ${x.partner}, Folding Team Into ${x.segment}`,
      `${x.full} has closed its acquisition of ${x.partner}, bringing the company's engineers and technology into its ${x.segment} unit. Executives said integration is on track and that the deal will contribute to ${x.driver} from the next quarter.`,
    ],
  ],
  Markets: [
    (x) => [
      `${x.n} Shares ${x.up ? 'Climb' : 'Slip'} ${x.pct4}% as Investors Reassess ${x.driver} Outlook`,
      `Shares of ${x.full} moved ${x.up ? 'higher' : 'lower'} by ${x.pct4}% in ${x.reg} trading as investors weighed the outlook for ${x.driver}. Analysts noted heavy volume and said sentiment will depend on upcoming guidance from management.`,
    ],
    (x) => [
      `Analysts Raise Price Targets on ${x.n} After Strong ${x.driver} Data`,
      `Several brokerages lifted their price targets on ${x.full}, pointing to resilient demand in ${x.driver} and improving margins in ${x.segment}. The stock has outperformed the broader sector over the past year, though some strategists urge caution on valuation.`,
    ],
    (x) => [
      `${x.n} Joins Rally in Technology Stocks as ${x.Reg} Markets Open Higher`,
      `${x.full} advanced alongside peers as markets in ${x.reg} opened higher, helped by easing rate expectations. Traders said gains in ${x.driver} led the move, with attention turning to the next round of economic data.`,
    ],
  ],
  Sustainability: [
    (x) => [
      `${x.n} Commits $${x.sb} Billion to Cut Emissions Across ${x.segment} by 2030`,
      `${x.full} announced a $${x.sb} billion programme to reduce emissions across its ${x.segment} operations by the end of the decade. The plan includes efficiency upgrades, supplier targets and expanded use of renewable electricity in ${x.reg}.`,
    ],
    (x) => [
      `${x.n} Signs Renewable Power Deals in ${x.Reg} to Run ${x.driver} Facilities`,
      `${x.full} has signed long-term renewable power agreements in ${x.reg} to supply its ${x.driver} facilities, adding several hundred megawatts of wind and solar capacity. The company said the contracts support its goal of matching consumption with clean energy.`,
    ],
    (x) => [
      `${x.n} Report Shows ${x.pct}% Lower Emissions as ${x.driver} Efficiency Improves`,
      `${x.full}'s latest sustainability report shows emissions fell ${x.pct}% from the prior baseline, driven by efficiency gains in ${x.driver} and greater use of recycled materials. The company acknowledged work remains in its supply chain.`,
    ],
  ],
  Cybersecurity: [
    (x) => [
      `${x.n} Rolls Out New Security Features to Protect ${x.driver} Users`,
      `${x.full} has begun deploying a set of security features across its ${x.driver} products, including stronger authentication and automated threat detection. The company said the update responds to rising demand from enterprise customers in ${x.reg}.`,
    ],
    (x) => [
      `${x.n} Strengthens Defences After Industry Warning on ${x.threat}`,
      `${x.full} is reinforcing its defences after a sector-wide advisory on ${x.threat}, adding monitoring and faster patching across ${x.segment}. Security researchers said coordinated disclosure between vendors has improved response times.`,
    ],
    (x) => [
      `${x.n} Expands Bug Bounty Programme to Cover ${x.driver} Products`,
      `${x.full} has widened its bug bounty programme to include ${x.driver} products, raising maximum rewards for critical findings. The move is intended to encourage independent researchers to report vulnerabilities before they can be exploited.`,
    ],
  ],
}

// ---- helpers --------------------------------------------------------------
const isoDay = (t) => new Date(t).toISOString().slice(0, 10)
const DAY = 86400000

function pickWeighted(rand, items) {
  const total = items.reduce((s, i) => s + i.w, 0)
  let r = rand() * total
  for (const i of items) {
    r -= i.w
    if (r <= 0) return i
  }
  return items[items.length - 1]
}

const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)]
const between = (rand, a, b, d = 0) => +(a + rand() * (b - a)).toFixed(d)

// Reported quarter = the calendar quarter before the publication date
function reportedQuarter(dateIso) {
  const d = new Date(dateIso + 'T12:00:00Z')
  let q = Math.floor(d.getUTCMonth() / 3) // 0-based current quarter
  let y = d.getUTCFullYear()
  q -= 1
  if (q < 0) {
    q = 3
    y -= 1
  }
  return `Q${q + 1} ${y}`
}

/**
 * @param {object} o
 * @param {number} o.recent   articles in the last ~6 months
 * @param {number} o.older    articles in the 2.5 years before that
 * @param {number} o.startId  first id
 */
export function generateArticles({ recent, older, startId, today }) {
  const rand = mulberry32(20260511)
  const todayT = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const sixMonthsAgo = todayT - 181 * DAY
  const threeYearsAgo = todayT - 1090 * DAY

  const seenTitles = new Set()
  const out = []

  const make = (windowStart, windowEnd) => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const t = windowStart + Math.floor(rand() * (windowEnd - windowStart))
      const date = isoDay(t)
      const co = pickWeighted(rand, COMPANIES)
      const subj = pickWeighted(rand, SUBJECTS)
      const src = pickWeighted(rand, SOURCES)
      const region = src.region ?? pickWeighted(rand, REGIONS).name
      const reg = REGION_PHRASE[region]

      const bn = between(rand, co.rev[0], co.rev[1], 1)
      const x = {
        n: co.n,
        full: co.full,
        driver: pick(rand, co.drivers),
        segment: pick(rand, co.segments),
        prod: pick(rand, co.products),
        partner: pick(rand, PARTNERS),
        threat: pick(rand, THREATS),
        q: reportedQuarter(date),
        reg,
        Reg: reg === 'the Middle East' ? 'Middle East' : reg,
        bn,
        ni: +(bn * between(rand, 0.14, 0.3, 2)).toFixed(1),
        pct: between(rand, 4, 31),
        pct2: between(rand, 2, 12),
        pct3: between(rand, 1, 6),
        pct4: between(rand, 1, 7, 1),
        deal: between(rand, 0.4, 9.5, 1),
        sb: between(rand, 0.5, 6, 1),
        up: rand() > 0.42,
      }

      const [title, body] = pick(rand, TEMPLATES[subj.name])(x)
      if (seenTitles.has(title)) continue
      seenTitles.add(title)

      // industries: company's own + a few topical extras
      const industry = [...co.industries]
      if ((subj.name === 'Earnings' || subj.name === 'Markets') && rand() < 0.6) industry.push('Financial Services')
      if (subj.name === 'Product Launches' && rand() < 0.1) industry.push('Healthcare')
      if (x.prod === 'Kuiper terminals' || (co.n === 'Google' && rand() < 0.08)) industry.push('Telecommunications')
      if (subj.name === 'Sustainability' && !industry.includes('Energy')) industry.push('Energy')

      out.push({
        id: startId + out.length,
        title,
        body,
        topic: subj.topic,
        source: src.name,
        date,
        readTime: Math.floor(rand() * 6) + 3,
        media: rand() < src.media ? 'Publication' : 'Web News',
        company: [co.full],
        industry: [...new Set(industry)],
        region: [region],
        subject: [subj.name],
        language: [src.language ?? 'English'],
      })
      return
    }
  }

  for (let i = 0; i < recent; i++) make(sixMonthsAgo, todayT + DAY) // up to and including today
  for (let i = 0; i < older; i++) make(threeYearsAgo, sixMonthsAgo)

  // keep the "Last Day" view populated: the two newest generated articles are from today
  out.sort((a, b) => b.date.localeCompare(a.date))
  out[0].date = out[1].date = isoDay(todayT)

  // Relevance order: newest first
  return out.sort((a, b) => b.date.localeCompare(a.date)).map((a, i) => ({ ...a, id: startId + i }))
}
