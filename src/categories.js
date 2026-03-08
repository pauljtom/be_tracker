export const CATEGORIES = [
  { id: 'housing',       label: 'Housing',       icon: '🏠', color: '#6366f1' },
  { id: 'food',          label: 'Food & Drink',  icon: '🍔', color: '#f59e0b' },
  { id: 'transport',     label: 'Transport',     icon: '🚗', color: '#60a5fa' },
  { id: 'petrol',        label: 'Petrol',        icon: '⛽', color: '#f97316' },
  { id: 'utilities',     label: 'Utilities',     icon: '💡', color: '#a78bfa' },
  { id: 'health',        label: 'Health',        icon: '❤️', color: '#f43f5e' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'savings',       label: 'Savings',       icon: '💰', color: '#34d399' },
  { id: 'shopping',      label: 'Shopping',      icon: '🛍️', color: '#f97316' },
  { id: 'income',        label: 'Income',        icon: '💵', color: '#4ade80' },
  { id: 'other',         label: 'Other',         icon: '📦', color: '#6b7280' },
]

export const EXP_CATS = CATEGORIES.filter(c => c.id !== 'income')

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export function getCat(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}

const RULES = [
  { patterns: ['restaurant', 'food & drink', 'groceries', 'coffee', 'cafe', 'bakery', 'takeaway', 'fast food', 'checkers', 'woolworths food', 'pick n pay', 'spar', 'shoprite'], cat: 'food' },
  { patterns: ['uber', 'taxi', 'parking', 'toll', 'ride', 'bus', 'train', 'metro', 'lyft'], cat: 'transport' },
  { patterns: ['fuel & gas', 'petrol', 'filling station', 'petrol station', 'garage', ' bp ', 'bp petrol', 'shell', 'engen', 'caltex', 'sasol', 'total garage', 'astron'], cat: 'petrol' },
  { patterns: ['phone & internet', 'electricity', 'water', 'internet', 'airtime', 'data', 'dstv', 'netflix', 'streaming'], cat: 'utilities' },
  { patterns: ['medical', 'pharmacy', 'wellness', 'hospital', 'doctor', 'dentist', 'optom', 'health', 'clicks', 'dis-chem', 'dischem'], cat: 'health' },
  { patterns: ['movies & tv', 'sport', 'recreation', 'gym', 'cinema', 'concert', 'spotify', 'gaming'], cat: 'entertainment' },
  { patterns: ['clothing', 'retail', 'fashion', 'apparel', 'shoes', 'woolworths', 'mr price', 'edgars', 'truworths', 'h&m', 'zara'], cat: 'shopping' },
  { patterns: ['rent', 'mortgage', 'levy', 'bond', 'home'], cat: 'housing' },
  { patterns: ['savings & investments', 'savings', 'investment', 'unit trust'], cat: 'savings' },
  { patterns: ['salary', 'wages', 'wage', 'payroll'], cat: 'income' },
]

export function mapCategory(rawParent = '', rawCat = '', description = '') {
  // Exact CSV category overrides
  if (rawCat.trim().toLowerCase() === 'fuel') return 'petrol'

  // First pass: match against the CSV category columns
  const catHaystack = `${rawParent} ${rawCat}`.toLowerCase()
  for (const rule of RULES) {
    if (rule.patterns.some(p => catHaystack.includes(p))) return rule.cat
  }
  // Second pass: fall back to description matching
  const descHaystack = ` ${description.toLowerCase()} `
  for (const rule of RULES) {
    if (rule.patterns.some(p => descHaystack.includes(p))) return rule.cat
  }
  return 'other'
}
