import { fmt, dateVal } from '../utils'

const FALLBACK = { id: 'other', label: 'Other', icon: '📦', color: '#6b7280' }

export default function TransactionList({ transactions, onEdit, onDelete, categories = [] }) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const sorted = [...transactions].sort((a, b) => dateVal(b.date) - dateVal(a.date))

  if (sorted.length === 0) return (
    <div className="card text-center py-12">
      <div className="text-4xl mb-3 select-none">📋</div>
      <p className="text-sm font-semibold text-n-sub mb-1.5">No transactions yet</p>
      <p className="text-xs text-n-muted">Add one above or import a CSV file</p>
    </div>
  )

  const totalExp = sorted.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalInc = sorted.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <p className="lbl">Transactions</p>
          <span className="font-mono text-[10px] bg-n-card2 rounded-md px-2 py-0.5 text-n-sub">
            {sorted.length}
          </span>
        </div>
        <div className="flex gap-4">
          {totalInc > 0 && (
            <span className="font-mono text-[11px] text-n-grn sens">+{fmt(totalInc)}</span>
          )}
          {totalExp > 0 && (
            <span className="font-mono text-[11px] text-n-red sens">−{fmt(totalExp)}</span>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-0.5">
        {sorted.map(tx => {
          const c = catMap[tx.category] ?? FALLBACK
          return (
            <div key={tx.id} className="tx-row">
              {/* Category icon */}
              <div className="text-xl w-9 text-center flex-shrink-0 select-none leading-none">
                {c.icon}
              </div>

              {/* Description + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-n-tx truncate sens">
                  {tx.description}
                </p>
                <p className="text-[11px] text-n-muted mt-0.5">
                  {c.label} · <span className="font-mono">{tx.date}</span>
                </p>
              </div>

              {/* Amount */}
              <span
                className={`font-mono text-sm font-semibold flex-shrink-0 sens ${
                  tx.type === 'income' ? 'text-n-grn' : 'text-n-red'
                }`}
                style={{ letterSpacing: '-.01em' }}
              >
                {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
              </span>

              {/* Actions — revealed on row hover */}
              <div className="acts flex gap-1.5 flex-shrink-0">
                <button className="btn-g btn-sm" onClick={() => onEdit(tx)} title="Edit">✏️</button>
                <button className="btn-del" onClick={() => onDelete(tx.id)} title="Delete">🗑️</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
