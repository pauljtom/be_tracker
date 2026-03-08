import { useState } from 'react'
import { fmt, dateVal } from '../utils'

const FALLBACK = { id: 'other', label: 'Other', icon: '📦', color: '#6b7280' }

export default function TransactionList({ transactions, onEdit, onDelete, categories = [] }) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const sorted = [...transactions].sort((a, b) => dateVal(b.date) - dateVal(a.date))
  const [open, setOpen] = useState({})

  function toggle(id) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (sorted.length === 0) return (
    <div className="card text-center py-12">
      <div className="text-4xl mb-3 select-none">📋</div>
      <p className="text-sm font-semibold text-n-sub mb-1.5">No transactions yet</p>
      <p className="text-xs text-n-muted">Add one above or import a CSV file</p>
    </div>
  )

  const expenses = sorted.filter(t => t.type === 'expense')
  const incomes  = sorted.filter(t => t.type === 'income')
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0)
  const totalInc = incomes.reduce((s, t) => s + t.amount, 0)

  function TxRow({ tx }) {
    const c = catMap[tx.category] ?? FALLBACK
    return (
      <div className="tx-row">
        <div className="text-xl w-9 text-center flex-shrink-0 select-none leading-none">
          {c.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-n-tx truncate sens">{tx.description}</p>
          <p className="text-[11px] text-n-muted mt-0.5">
            {c.label} · <span className="font-mono">{tx.date}</span>
          </p>
        </div>
        <span
          className={`font-mono text-sm font-semibold flex-shrink-0 sens ${
            tx.type === 'income' ? 'text-n-grn' : 'text-n-red'
          }`}
          style={{ letterSpacing: '-.01em' }}
        >
          {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
        </span>
        <div className="acts flex gap-1.5 flex-shrink-0">
          <button className="btn-g btn-sm" onClick={() => onEdit(tx)} title="Edit">✏️</button>
          <button className="btn-del" onClick={() => onDelete(tx.id)} title="Delete">🗑️</button>
        </div>
      </div>
    )
  }

  // Group expenses by category, sorted alphabetically by label
  const expByCat = expenses.reduce((acc, tx) => {
    const key = tx.category || 'other'
    ;(acc[key] ??= []).push(tx)
    return acc
  }, {})
  const expCatGroups = Object.entries(expByCat)
    .map(([catId, rows]) => ({ cat: catMap[catId] ?? FALLBACK, rows }))
    .sort((a, b) => a.cat.label.localeCompare(b.cat.label))

  function CollapseHeader({ id, label, count, total, colorClass, indent = false }) {
    const expanded = !!open[id]
    return (
      <button
        className={`w-full flex items-center justify-between py-1.5 rounded-[8px] hover:bg-n-card2 transition-colors duration-100 ${indent ? 'px-3' : 'px-1'}`}
        onClick={() => toggle(id)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[.1em] uppercase text-n-muted">{label}</span>
          <span className="font-mono text-[10px] bg-n-card2 rounded-md px-1.5 py-0.5 text-n-sub">{count}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`font-mono text-[11px] font-semibold sens ${colorClass}`}>{total}</span>
          <span className={`chevron${expanded ? ' open' : ''}`}>▼</span>
        </div>
      </button>
    )
  }

  const expExpanded = !!open['expenses']

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <p className="lbl">Transactions</p>
        <span className="font-mono text-[10px] bg-n-card2 rounded-md px-2 py-0.5 text-n-sub">
          {sorted.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Income */}
        {incomes.length > 0 && (
          <div>
            <CollapseHeader
              id="income"
              label="Income"
              count={incomes.length}
              total={`+${fmt(totalInc)}`}
              colorClass="text-n-grn"
            />
            <div className={`collapsible${open['income'] ? ' open' : ''}`}>
              <div className="flex flex-col gap-0.5 mt-1">
                {incomes.map(tx => <TxRow key={tx.id} tx={tx} />)}
              </div>
            </div>
          </div>
        )}

        {/* Expenses */}
        {expenses.length > 0 && (
          <div>
            <CollapseHeader
              id="expenses"
              label="Expenses"
              count={expenses.length}
              total={`−${fmt(totalExp)}`}
              colorClass="text-n-red"
            />
            <div className={`collapsible${expExpanded ? ' open' : ''}`}>
              <div className="flex flex-col gap-1 mt-1 pl-3 border-l border-n-bdr">
                {expCatGroups.map(({ cat, rows }) => {
                  const catTotal = rows.reduce((s, t) => s + t.amount, 0)
                  const catKey   = `cat_${cat.id}`
                  return (
                    <div key={cat.id}>
                      <CollapseHeader
                        id={catKey}
                        label={`${cat.icon} ${cat.label}`}
                        count={rows.length}
                        total={`−${fmt(catTotal)}`}
                        colorClass="text-n-red"
                        indent
                      />
                      <div className={`collapsible${open[catKey] ? ' open' : ''}`}>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {rows.map(tx => <TxRow key={tx.id} tx={tx} />)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
