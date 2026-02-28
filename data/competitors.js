// SVG ring: circumference = 2 * PI * 33 ≈ 207.3
const C = 2 * Math.PI * 33

export const competitors = [
  {
    company: 'Fluidra',
    score: 10,
    description: '~€2.3B revenue · Pool & wellness is the entire business',
    color: 'var(--fluidra-color)',
    strokeColor: 'rgba(52,211,153,0.2)',
    dashoffset: 0,
    tags: ['Freepool2', 'Active Acquirer', 'Hospitality'],
    tagStyle: { color: 'var(--fluidra-color)', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' },
    detail: 'Most active pool tech acquirer (4 deals in 2021 + Variopool + ~$100M Aiper). Freepool2 system (UV + low-salinity electrolysis + CO₂) proves direct interest in non-chemical pool innovation. Distribution infrastructure already built for pool-specific technology scaling.',
  },
  {
    company: 'Pentair',
    score: 9,
    description: '~$3.8B revenue · Pool/spa is ~40%+ of revenue',
    color: 'var(--pentair-color)',
    strokeColor: 'rgba(59,139,235,0.2)',
    dashoffset: C * 0.1,
    tags: ['IntelliChlor', '96% Chloramine Reduction', 'Full Stack'],
    tagStyle: { color: 'var(--pentair-color)', background: 'rgba(59,139,235,0.1)', border: '1px solid rgba(59,139,235,0.2)' },
    detail: 'Already markets "up to 96% chloramine reduction without harmful chemicals" for commercial pools. Deep residential + commercial penetration. Comprehensive platform: pumps, filters, heaters, salt chlorination, lighting, automation (ScreenLogic).',
  },
  {
    company: 'Xylem',
    score: 5,
    description: '$9.0B revenue · Aquatics is a niche within a massive portfolio',
    color: 'var(--xylem-color)',
    strokeColor: 'rgba(251,191,36,0.2)',
    dashoffset: C * 0.5,
    tags: ['Neptune Benson', '80/20 Risk', 'AI/Digital Focus'],
    tagStyle: { color: 'var(--xylem-color)', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' },
    detail: 'Entry point exists via Neptune Benson heritage, but aquatics is potentially at risk under 80/20 simplification. Strategic timing is wrong — digesting Evoqua, simplifying portfolio, pivoting to digital/AI. Tier-two acquirer that upgrades to tier-one only if HydroCav proves cross-market applicability.',
  },
]
