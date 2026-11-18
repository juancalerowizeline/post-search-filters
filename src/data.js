import { generateArticles } from './generateArticles.js'

// Reference "today" for the demo (end of the volume chart in the design: 29 oct 2026)
export const NOW = new Date('2026-10-29T23:59:59Z')

export const MEDIA_TYPES = ['All', 'Publication', 'Web News']

// A range is "N days ending today, inclusive". `gran` = default distribution of the
// "Volume by date" bars for that range (the dropdown can override it).
export const DATE_RANGES = [
  { id: '1d', label: 'Last Day', days: 1, gran: 'day' },
  { id: '1w', label: 'Last Week', days: 7, gran: 'day' },
  { id: '1m', label: 'Last Month', days: 30, gran: 'week' },
  { id: '3m', label: 'Last 3 months', days: 91, gran: 'week' },
  { id: '6m', label: 'Last 6 months', days: 182, gran: 'month' },
  // shown under "Show more" in the Date Range group
  { id: '1y', label: 'Last year', days: 365, gran: 'month' },
  { id: '2y', label: 'Last 2 years', days: 730, gran: 'month' },
  { id: '3y', label: 'Last 3 years', days: 1095, gran: 'year' },
  { id: 'all', label: 'All', days: null, gran: 'year' }, // no date limit
]

export const VISIBLE_RANGES = 5

// Facets rendered as checkbox groups. `visible` = options shown before "Show more".
export const FACETS = [
  {
    key: 'source',
    title: 'Source',
    placeholder: 'Search Source',
    options: [
      'Bloomberg',
      'The Wall Street Journal',
      'Example Inc. Newswires',
      '台灣蘋果日報',
      'Reuters',
      'Financial Times',
      'Les Echos (French language translation)',
      'Handelsblatt (German language translation)',
      'Expansión (Spanish language translation)',
    ],
  },
  {
    key: 'company',
    title: 'Company',
    placeholder: 'Search Company',
    options: [
      'Apple Inc.',
      'Alphabet Inc.',
      'Microsoft Corp.',
      'Tesla Inc.',
      'Amazon.com Inc.',
      'Ford Motor Company',
      'NVIDIA Corporation',
    ],
  },
  {
    key: 'industry',
    title: 'Industries',
    placeholder: 'Search Industries',
    options: [
      'Financial Services',
      'Technology',
      'Healthcare',
      'Energy',
      'Consumer Electronics',
      'Telecommunications',
      'Retail',
      'Automotive',
    ],
  },
  {
    key: 'region',
    title: 'Region',
    placeholder: 'Search Region',
    options: ['North America', 'Europe', 'South America', 'Asia Pacific', 'Middle East'],
  },
  {
    key: 'subject',
    title: 'Subject',
    placeholder: 'Search Subject',
    options: [
      'Earnings',
      'Mergers & Acquisitions',
      'Regulation',
      'Markets',
      'Product Launches',
      'Sustainability',
      'Cybersecurity',
    ],
  },
  {
    key: 'language',
    title: 'Language',
    placeholder: 'Search Language',
    options: ['English', 'French', 'German', 'Spanish', 'Chinese'],
  },
]

export const VISIBLE_OPTIONS = 5

const SRC = {
  bloomberg: 'Bloomberg',
  wsj: 'The Wall Street Journal',
  djn: 'Example Inc. Newswires',
  taiwan: '台灣蘋果日報',
  reuters: 'Reuters',
}

// Each article carries the metadata the filters operate on.
const SAMPLE_ARTICLES = [
  {
    id: 1,
    title: 'Google Launches Gemini 2.0, Advancing AI Agent Capabilities',
    body: 'Google has unveiled Gemini 2.0, its most advanced AI model yet, featuring enhanced reasoning capabilities and native image generation. The model demonstrates significant improvements in coding tasks and can now power more sophisticated AI agents that can take actions on behalf of users across Google services.',
    topic: 'AI',
    source: SRC.bloomberg,
    date: '2026-10-28',
    readTime: 5,
    media: 'Publication',
    company: ['Alphabet Inc.'],
    industry: ['Technology'],
    region: ['North America'],
    subject: ['Product Launches'],
    language: ['English'],
  },
  {
    id: 2,
    title: 'Apple Announces Vision Pro 2 with Enhanced Field of View',
    body: 'Apple has announced the second generation of its Vision Pro headset, featuring a 40% wider field of view, improved eye tracking precision, and a lighter design. The new model introduces advanced hand gesture recognition and seamless integration with the Apple ecosystem, positioning itself as the definitive spatial computing device.',
    topic: 'Devices',
    source: SRC.wsj,
    date: '2026-10-22',
    readTime: 4,
    media: 'Publication',
    company: ['Apple Inc.'],
    industry: ['Technology', 'Consumer Electronics'],
    region: ['North America'],
    subject: ['Product Launches'],
    language: ['English'],
  },
  {
    id: 3,
    title: 'Google Cloud Revenue Surges 35% as Enterprise AI Adoption Accelerates',
    body: 'Alphabet reported that Google Cloud revenue reached $11.4 billion in Q1 2026, driven by strong demand for AI infrastructure and enterprise solutions. The cloud division achieved profitability for the fifth consecutive quarter, with major clients deploying Vertex AI for custom model training and deployment.',
    topic: 'Earnings',
    source: SRC.djn,
    date: '2026-05-06',
    readTime: 6,
    media: 'Web News',
    company: ['Alphabet Inc.'],
    industry: ['Technology', 'Financial Services'],
    region: ['North America'],
    subject: ['Earnings'],
    language: ['English'],
  },
  {
    id: 4,
    title: 'Apple Partners with Major Banks to Launch Expanded Savings Features',
    body: 'Apple has announced partnerships with leading financial institutions to expand Apple Card savings features, offering competitive interest rates and seamless integration with Apple Wallet. The initiative aims to position Apple as a comprehensive financial services platform, with new investment tools coming later this year.',
    topic: 'Fintech',
    source: SRC.bloomberg,
    date: '2026-09-14',
    readTime: 5,
    media: 'Publication',
    company: ['Apple Inc.'],
    industry: ['Financial Services', 'Technology'],
    region: ['North America'],
    subject: ['Markets'],
    language: ['English'],
  },
  {
    id: 5,
    title: 'Google Maps Introduces AR Navigation for Indoor Spaces',
    body: 'Google Maps has rolled out augmented reality navigation for indoor environments, starting with major airports and shopping malls. The feature uses phone cameras and AI to overlay directional arrows and points of interest, making it easier to navigate complex indoor spaces without relying on traditional signage.',
    topic: 'Maps',
    source: SRC.reuters,
    date: '2026-08-03',
    readTime: 3,
    media: 'Web News',
    company: ['Alphabet Inc.'],
    industry: ['Technology', 'Retail'],
    region: ['Europe'],
    subject: ['Product Launches'],
    language: ['English'],
  },
  {
    id: 6,
    title: 'Apple Watch Series 10 Receives FDA Approval for Blood Glucose Monitoring',
    body: 'The FDA has approved Apple Watch Series 10 for non-invasive blood glucose monitoring, marking a breakthrough in diabetes management. The feature uses advanced optical sensors to measure glucose levels through the skin, eliminating the need for finger pricks and providing continuous monitoring throughout the day.',
    topic: 'Health',
    source: SRC.djn,
    date: '2026-07-19',
    readTime: 5,
    media: 'Publication',
    company: ['Apple Inc.'],
    industry: ['Healthcare', 'Consumer Electronics'],
    region: ['North America'],
    subject: ['Regulation'],
    language: ['English'],
  },
  {
    id: 7,
    title: 'YouTube Premium Reaches 150 Million Subscribers Worldwide',
    body: 'YouTube Premium has surpassed 150 million subscribers globally, driven by ad-free viewing, background play, and exclusive content. The platform has also introduced new AI-powered features for creators, including automated editing tools and personalized content recommendations that have increased engagement by 40%.',
    topic: 'Media',
    source: SRC.reuters,
    date: '2026-06-02',
    readTime: 4,
    media: 'Web News',
    company: ['Alphabet Inc.'],
    industry: ['Technology', 'Telecommunications'],
    region: ['Asia Pacific'],
    subject: ['Markets'],
    language: ['English'],
  },
  {
    id: 8,
    title: 'Apple Expands Renewable Energy Commitment with New Solar Farms',
    body: 'Apple has announced plans to build three new solar farms across the United States, furthering its commitment to becoming carbon neutral across its entire supply chain by 2030. The facilities will generate enough clean energy to power all Apple retail stores and data centers in North America.',
    topic: 'Sustainability',
    source: SRC.wsj,
    date: '2026-06-11',
    readTime: 4,
    media: 'Publication',
    company: ['Apple Inc.'],
    industry: ['Energy'],
    region: ['North America'],
    subject: ['Sustainability'],
    language: ['English'],
  },
  {
    id: 9,
    title: 'Google Introduces AI-Powered Cybersecurity Suite for Enterprise',
    body: 'Google has launched Chronicle SecOps 2.0, an AI-driven cybersecurity platform that uses machine learning to detect and respond to threats in real-time. The system analyzes billions of security events per day and has demonstrated a 60% reduction in false positives compared to traditional security tools.',
    topic: 'Security',
    source: SRC.taiwan,
    date: '2026-05-21',
    readTime: 5,
    media: 'Web News',
    company: ['Alphabet Inc.'],
    industry: ['Technology'],
    region: ['Europe'],
    subject: ['Cybersecurity', 'Product Launches'],
    language: ['Chinese'],
  },
  {
    id: 10,
    title: 'Apple Silicon M4 Chip Outperforms Intel and AMD in Benchmark Tests',
    body: "Independent benchmark tests reveal that Apple's new M4 chip delivers unprecedented performance-per-watt efficiency, outperforming both Intel and AMD's latest offerings. The chip features enhanced neural engine capabilities and supports up to 192GB of unified memory, making it ideal for AI workloads and professional workflows.",
    topic: 'Chips',
    source: SRC.bloomberg,
    date: '2026-10-05',
    readTime: 6,
    media: 'Publication',
    company: ['Apple Inc.'],
    industry: ['Technology', 'Consumer Electronics'],
    region: ['Asia Pacific'],
    subject: ['Product Launches', 'Markets'],
    language: ['English'],
  },
]

// 10 headlines from the Figma design + generated sample content (~3 years, newest first)
// so the paginator and every filter have enough to work with.
// `enterpriseAI` = eligible for enterprise AI use; sample flag (~60%) derived from the id so it is stable
const isEnterpriseAI = (id) => (id * 2654435761) % 10 < 6
export const ARTICLES = [
  ...SAMPLE_ARTICLES,
  ...generateArticles({ recent: 58, older: 192, startId: SAMPLE_ARTICLES.length + 1, today: NOW }),
].map((a) => ({ ...a, enterpriseAI: isEnterpriseAI(a.id) }))

// ---- filtering helpers ----------------------------------------------------

const valuesOf = (article, key) => {
  const v = article[key]
  return Array.isArray(v) ? v : [v]
}

export function inRange(article, rangeId) {
  if (!rangeId) return true
  const range = DATE_RANGES.find((r) => r.id === rangeId)
  if (!range.days) return true
  const t = new Date(article.date + 'T12:00:00Z').getTime()
  const startOfToday = Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate())
  return t >= startOfToday - (range.days - 1) * 86400000
}

// "Or and version": these groups get an or / and radio (or = any selected value, and = all of them)
export const OR_AND_FACETS = ['source', 'company', 'industry', 'region', 'subject']

function matchesFacet(article, key, selection, mode) {
  const entries = Object.entries(selection || {})
  const inc = entries.filter(([, s]) => s === 'in').map(([v]) => v)
  const exc = entries.filter(([, s]) => s === 'out').map(([v]) => v)
  const vals = valuesOf(article, key)
  if (inc.length) {
    const ok = mode === 'and' ? inc.every((v) => vals.includes(v)) : vals.some((v) => inc.includes(v))
    if (!ok) return false
  }
  if (exc.length && vals.some((v) => exc.includes(v))) return false
  return true
}

/**
 * filters = { media, range, bucket, query, enterpriseAI, facets: { [facetKey]: { [value]: 'in' | 'out' } } }
 * `bucket` = { start, end, label } (ISO days, inclusive) — the bar picked in "Volume by date".
 * `skip` (string or array) ignores dimensions ('media' | 'range' | 'bucket' | 'enterpriseAI' | facetKey)
 * to compute facet counts / chart data.
 */
export function applyFilters(articles, filters, skip) {
  const q = filters.query.trim().toLowerCase()
  const skips = [].concat(skip || [])
  const b = filters.bucket
  return articles.filter((a) => {
    if (!skips.includes('media') && filters.media !== 'All' && a.media !== filters.media) return false
    if (!skips.includes('range') && !inRange(a, filters.range)) return false
    if (!skips.includes('enterpriseAI') && filters.enterpriseAI && !a.enterpriseAI) return false
    if (!skips.includes('bucket') && b && (a.date < b.start || a.date > b.end)) return false
    if (q && !(a.title + ' ' + a.body).toLowerCase().includes(q)) return false
    for (const f of FACETS) {
      if (skips.includes(f.key)) continue
      if (!matchesFacet(a, f.key, filters.facets[f.key], filters.facetModes?.[f.key])) return false
    }
    return true
  })
}

export function facetCount(articles, filters, facetKey, value) {
  return applyFilters(articles, filters, facetKey).filter((a) =>
    valuesOf(a, facetKey).includes(value),
  ).length
}

// ---- "Volume by date" -----------------------------------------------------

const DAY = 86400000
const iso = (t) => new Date(t).toISOString().slice(0, 10)
const fmt = (t, opts) => new Date(t).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts })
const fmtDay = (t) => fmt(t, { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase() // "01 may 2026"

// Options of the distribution dropdown (Figma `.Select Dropdown (Web)`)
export const DISTRIBUTIONS = [
  { id: 'day', label: 'Daily distribution', header: 'Day' },
  { id: 'week', label: 'Weekly distribution', header: 'Week' },
  { id: 'month', label: 'Monthly distribution', header: 'Month' },
  { id: 'year', label: 'Yearly distribution', header: 'Year' },
]

// More bars than this would be thinner than ~3px, so that distribution is not offered
export const MAX_BARS = 53

/** Time window shown by the chart: the selected Date Range (or the whole 3-year sample span). */
export function chartWindow(rangeId) {
  const today = Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate())
  const range = DATE_RANGES.find((r) => r.id === rangeId)
  let start
  if (range?.days) start = today - (range.days - 1) * DAY
  else start = Math.min(...ARTICLES.map((a) => Date.parse(a.date + 'T00:00:00Z'))) // "All": back to the oldest article
  return { start, end: today, gran: range ? range.gran : 'year' }
}

/**
 * Bars for the chart. The window follows the Date Range; the distribution (day / week / month /
 * year) is the range's default unless `filters.dist` overrides it (or `gran` is passed).
 * Counts honour every other active filter except the picked bar itself, so other bars stay visible.
 */
export function volumeBuckets(articles, filters, gran) {
  const win = chartWindow(filters.range)
  const { start, end } = win
  gran = gran ?? filters.dist ?? win.gran
  const pool = applyFilters(articles, filters, ['range', 'bucket'])

  const bins = []
  if (gran === 'day') {
    for (let t = start; t <= end; t += DAY) bins.push([t, t])
  } else if (gran === 'week') {
    // weeks are counted back from today, so the last bar always ends on today (the first may be shorter)
    for (let e = end; e >= start; e -= 7 * DAY) bins.unshift([Math.max(e - 6 * DAY, start), e])
  } else {
    // calendar months or years overlapping the window
    for (let t = start; t <= end; ) {
      const d = new Date(t)
      const binEnd =
        gran === 'year'
          ? Date.UTC(d.getUTCFullYear() + 1, 0, 0)
          : Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)
      bins.push([t, Math.min(binEnd, end)])
      t = binEnd + DAY
    }
  }

  const buckets = bins.map(([s, e]) => {
    const a = iso(s)
    const b = iso(e)
    const label =
      gran === 'year'
        ? String(new Date(s).getUTCFullYear())
        : gran === 'month'
          ? fmt(s, { month: 'long', year: 'numeric' })
          : s === e
            ? fmt(s, { day: 'numeric', month: 'short', year: 'numeric' })
            : `${fmt(s, { day: 'numeric', month: 'short' })} – ${fmt(e, { day: 'numeric', month: 'short', year: 'numeric' })}`
    return { start: a, end: b, label, count: pool.filter((x) => x.date >= a && x.date <= b).length }
  })

  // Axis ends mirror the selected range (one label when the range is a single day)
  return { buckets, gran, from: fmtDay(start), to: fmtDay(end), single: start === end }
}

export const GMT_TIME = '12:00 AM GMT'

export function formatDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
