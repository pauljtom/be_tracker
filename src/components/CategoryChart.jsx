import { CATEGORY_MAP } from '../categories'

export default function CategoryChart({ transactions }) {
  const expenses = transactions.filter(t => t.amount < 0)
  const total = expenses.reduce((s, t) => s + Math.abs(t.amount), 0)

  const byCategory = {}
  for (const t of expenses) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount)
  }

  const sorted = Object.entries(byCategory)
    .map(([id, amt]) => ({ id, amt, pct: total > 0 ? (amt / total) * 100 : 0 }))
    .sort((a, b) => b.amt - a.amt)

  if (sorted.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Spending by Category</h2>
        <p className="text-gray-600 text-sm text-center py-6">No expense data yet</p>
      </div>
    )
  }

  const BAR_COLORS = [
    'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
  ]

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Spending by Category</h2>
      <div className="space-y-3">
        {sorted.map(({ id, amt, pct }, i) => {
          const cm = CATEGORY_MAP[id] || CATEGORY_MAP.other
          return (
            <div key={id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cm.icon}</span>
                  <span className="text-sm text-gray-300">{cm.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                  <span className="text-sm text-white font-medium w-28 text-right">
                    R {amt.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${pct}%`, transition: 'width 0.5s' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
