import { useState } from 'react'
import { fmt } from '../utils'

export default function BudgetSection({ budgets, onAdd, onDelete, salary = 0, spent = 0 }) {
  const [name,   setName]   = useState('')
  const [amount, setAmount] = useState('')

  function add() {
    const n = name.trim()
    const a = parseFloat(amount)
    if (!n || !(a > 0)) return
    onAdd({ id: crypto.randomUUID(), name: n, amount: a })
    setName('')
    setAmount('')
  }

  const currentBalance = salary - spent
  const total          = budgets.reduce((s, b) => s + b.amount, 0)
  const remaining      = currentBalance - total
  const pct            = salary > 0 ? Math.min((total / salary) * 100, 100) : 0
  const barColor       = pct >= 100 ? '#f87171' : pct >= 80 ? '#fbbf24' : '#34d399'
  const remCls         = remaining >= 0 ? 'text-n-grn' : 'text-n-red'

  // Running balance per budget item
  const itemsWithBalance = budgets.reduce((acc, b) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].runningBalance : currentBalance
    return [...acc, { ...b, runningBalance: prev - b.amount }]
  }, [])

  return (
    <div className="card">
      <p className="lbl mb-4">Budget</p>

      {/* Add form */}
      <div className="flex gap-2 mb-4">
        <input
          className="field flex-1"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <div className="relative" style={{ minWidth: 120 }}>
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-n-sub pointer-events-none">
            R
          </span>
          <input
            className="field font-mono pl-7"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
        </div>
        <button className="btn-p" onClick={add}>Add</button>
      </div>

      {/* Budget items */}
      {budgets.length === 0 ? (
        <p className="text-xs text-n-muted text-center py-4">No budget allocations yet</p>
      ) : (
        <div className="flex flex-col gap-0.5 mb-4">
          {itemsWithBalance.map(b => (
            <div key={b.id} className="tx-row">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-n-tx truncate">{b.name}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-sm font-semibold text-n-sub sens">
                  −{fmt(b.amount)}
                </span>
                <span className={`font-mono text-sm font-semibold sens ${b.runningBalance >= 0 ? 'text-n-grn' : 'text-n-red'}`}>
                  {fmt(b.runningBalance)}
                </span>
              </div>
              <div className="acts flex-shrink-0">
                <button className="btn-del" onClick={() => onDelete(b.id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance preview */}
      {(salary > 0 || spent > 0 || total > 0) && (
        <div className="border-t border-n-bdr pt-4 mt-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Balance',   val: fmt(currentBalance), cls: currentBalance >= 0 ? 'text-n-grn' : 'text-n-red' },
              { label: 'Allocated', val: fmt(total),          cls: 'text-n-sub' },
              { label: 'Remaining', val: fmt(remaining),      cls: remCls },
            ].map(({ label, val, cls }) => (
              <div key={label} className="text-center">
                <p className="lbl mb-1.5">{label}</p>
                <p className={`font-mono font-semibold sens ${cls}`} style={{ fontSize: 15, letterSpacing: '-.02em' }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          <div className="h-[5px] bg-n-card2 rounded-full overflow-hidden">
            {pct > 0 && (
              <div
                className="h-full rounded-full prog-anim"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
              />
            )}
          </div>
          <p className="font-mono text-[10px] text-n-muted mt-1.5 text-right sens">
            {pct.toFixed(1)}% of income allocated
          </p>
        </div>
      )}
    </div>
  )
}
