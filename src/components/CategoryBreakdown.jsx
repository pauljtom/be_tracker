import { useState } from 'react'
import { fmt, dateVal } from '../utils'

export default function CategoryBreakdown({ transactions, categories = [] }) {
  const [open, setOpen] = useState(null)

  const expenses = transactions.filter(t => t.type === 'expense')
  const total    = expenses.reduce((s, t) => s + t.amount, 0)

  if (total === 0) return (
    <div className="card">
      <p className="lbl mb-3">Spending Breakdown</p>
      <p className="text-sm text-n-muted text-center py-6">No expenses recorded</p>
    </div>
  )

  const breakdown = categories
    .filter(c => c.id !== 'income')
    .map(c => ({
      ...c,
      amt:   expenses.filter(t => t.category === c.id).reduce((s, t) => s + t.amount, 0),
      items: expenses
        .filter(t => t.category === c.id)
        .sort((a, b) => dateVal(b.date) - dateVal(a.date)),
    }))
    .filter(c => c.amt > 0)
    .sort((a, b) => b.amt - a.amt)

  return (
    <div className="card">
      <p className="lbl mb-4">Spending Breakdown</p>
      <div className="flex flex-col gap-0.5">
        {breakdown.map(c => {
          const pct      = (c.amt / total) * 100
          const isOpen   = open === c.id

          return (
            <div key={c.id} className="rounded-[10px] overflow-hidden">
              {/* ── Row ── */}
              <button
                onClick={() => setOpen(isOpen ? null : c.id)}
                className="w-full text-left px-2.5 py-2.5 hover:bg-n-card2 rounded-[10px] transition-colors group"
              >
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-n-sub group-hover:text-n-tx transition-colors">
                    {c.icon} {c.label}
                    <span className="text-n-muted text-[10px] group-hover:text-n-sub transition-colors">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-n-tx sens">
                    {fmt(c.amt)}{' '}
                    <span className="text-n-muted text-[10px]">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-[3px] bg-n-card2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bar-anim"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${c.color}70, ${c.color})`,
                    }}
                  />
                </div>
              </button>

              {/* ── Expanded items ── */}
              {isOpen && (
                <div className="mt-0.5 mb-1.5 ml-3 border-l-2 pl-3" style={{ borderColor: `${c.color}60` }}>
                  {c.items.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-1.5">
                      <div className="min-w-0">
                        <p className="text-[12px] text-n-tx truncate sens">{tx.description}</p>
                        <p className="text-[10px] text-n-muted font-mono">{tx.date}</p>
                      </div>
                      <span className="font-mono text-[12px] text-n-red ml-3 flex-shrink-0 sens">
                        −{fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
