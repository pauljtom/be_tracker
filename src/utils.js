import { mapCategory } from './categories'

export const fmt = n =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2,
  }).format(n)

export function parseAmt(str) {
  if (!str) return 0
  let s = String(str).replace(/[^0-9.,]/g, '')
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '')
  else if (s.includes(',')) s = s.replace(',', '.')
  return Math.abs(parseFloat(s) || 0)
}

function parseLine(line) {
  const out = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (ch === ',' && !inQ) {
      out.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur.trim())
  return out
}

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  // Strip BOM, quotes, lowercase, trim each header
  const hdrs = parseLine(lines[0]).map(h =>
    h.replace(/^\uFEFF/, '').replace(/^"|"$/g, '').toLowerCase().trim()
  )
  const col = name => hdrs.indexOf(name)

  const C = {
    txDate: col('transaction date'),
    desc:   col('description'),
    pcat:   col('parent category'),
    cat:    col('category'),
    mIn:    col('money in'),
    mOut:   col('money out'),
  }

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const f = parseLine(lines[i])
    if (f.length < 4) continue

    const mIn  = parseAmt(f[C.mIn]  ?? '')
    const mOut = parseAmt(f[C.mOut] ?? '')
    const desc = (f[C.desc]   ?? '').replace(/^"|"$/g, '').trim()
    const date = (f[C.txDate] ?? '').replace(/^"|"$/g, '').trim()
    const cat  = mapCategory(f[C.pcat] ?? '', f[C.cat] ?? '', desc)

    if (mOut > 0) {
      rows.push({ id: crypto.randomUUID(), description: desc, amount: mOut, category: cat, date, type: 'expense' })
    } else if (mIn > 0) {
      rows.push({ id: crypto.randomUUID(), description: desc, amount: mIn, category: 'income', date, type: 'income' })
    }
  }
  return rows
}

export function dateVal(s) {
  if (!s) return 0
  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}/.test(s)) return new Date(s.replace(/\//g, '-')).getTime() || 0
  // DD/MM/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (m) return new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`).getTime() || 0
  return new Date(s).getTime() || 0
}

export const today = () => new Date().toISOString().split('T')[0]
