// Reference "today" for the demo (end of the volume chart in the design: 29 oct 2026)
export const NOW = new Date('2026-10-29T23:59:59Z')

export const MEDIA_TYPES = ['All', 'Publication', 'Web News']

export const DATE_RANGES = [
  { id: '1d', label: 'Last Day', days: 1 },
  { id: '1w', label: 'Last Week', days: 7 },
  { id: '1m', label: 'Last Month', days: 30 },
  { id: '3m', label: 'Last 3 months', days: 91 },
  { id: '6m', label: 'Last 6 months', days: 182 },
]

// Facets rendered as checkbox groups. `visible` = options shown before "Show more".
export const FACETS = [
  {
    key: 'source',
    title: 'Source',
    placeholder: 'Search Source',
    options: [
      'Bloomberg',
      'The Wall Street Journal',
      'Dow Jones Newswires',
      'Apple Daily Taiwan (Chinese language translation)',
      'Reuters',
      'Financial Times',
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
  djn: 'Dow Jones Newswires',
  taiwan: 'Apple Daily Taiwan (Chinese language translation)',
  reuters: 'Reuters',
}

// Each article carries the metadata the filters operate on.
export const ARTICLES = [
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

// ---- filtering helpers ----------------------------------------------------

const valuesOf = (article, key) => {
  const v = article[key]
  return Array.isArray(v) ? v : [v]
}

export function inRange(article, rangeId) {
  if (!rangeId) return true
  const range = DATE_RANGES.find((r) => r.id === rangeId)
  const t = new Date(article.date + 'T12:00:00Z').getTime()
  const startOfToday = Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate())
  return t >= startOfToday - range.days * 86400000
}

function matchesFacet(article, key, selection) {
  const entries = Object.entries(selection || {})
  const inc = entries.filter(([, s]) => s === 'in').map(([v]) => v)
  const exc = entries.filter(([, s]) => s === 'out').map(([v]) => v)
  const vals = valuesOf(article, key)
  if (inc.length && !vals.some((v) => inc.includes(v))) return false
  if (exc.length && vals.some((v) => exc.includes(v))) return false
  return true
}

/**
 * filters = { media, range, query, facets: { [facetKey]: { [value]: 'in' | 'out' } } }
 * `skip` lets us ignore one dimension ('range' | facetKey) to compute facet counts / chart data.
 */
export function applyFilters(articles, filters, skip) {
  const q = filters.query.trim().toLowerCase()
  return articles.filter((a) => {
    if (skip !== 'media' && filters.media !== 'All' && a.media !== filters.media) return false
    if (skip !== 'range' && !inRange(a, filters.range)) return false
    if (q && !(a.title + ' ' + a.body).toLowerCase().includes(q)) return false
    for (const f of FACETS) {
      if (f.key === skip) continue
      if (!matchesFacet(a, f.key, filters.facets[f.key])) return false
    }
    return true
  })
}

export function facetCount(articles, filters, facetKey, value) {
  return applyFilters(articles, filters, facetKey).filter((a) =>
    valuesOf(a, facetKey).includes(value),
  ).length
}

export const MONTHS = [
  { label: 'May', month: 4 },
  { label: 'Jun', month: 5 },
  { label: 'Jul', month: 6 },
  { label: 'Aug', month: 7 },
  { label: 'Sep', month: 8 },
  { label: 'Oct', month: 9 },
]

export function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00Z')
  return (
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) +
    '  12:00 AM GMT'
  )
}
