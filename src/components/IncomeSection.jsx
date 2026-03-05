import { useState } from 'react'
import { fmt } from '../utils'

export default function IncomeSection({ salary, onSave }) {
  const [editing, setEditing] = useState(salary === 0)
  const [val, setVal] = useState('')

  function save() {
    const n = parseFloat(val)
    if (n > 0) { onSave(n); setEditing(false) }
  }

  function startEdit() {
    setVal(salary > 0 ? String(salary) : '')
    setEditing(true)
  }

  return (
    <div
      className="card relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #16161e 0%, #1c1c28 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,.07) 0%, transparent 68%)' }}
      />

      <p className="lbl mb-2.5">Monthly Income</p>

      {editing ? (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1" style={{ minWidth: 160 }}>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-n-sub">
              R
            </span>
            <input
              className="field font-mono pl-7"
              type="number"
              min="0"
              step="0.01"
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="0.00"
              autoFocus
            />
          </div>
          <button onClick={save} className="btn-p">Save</button>
          {salary > 0 && (
            <button onClick={() => setEditing(false)} className="btn-g">Cancel</button>
          )}
        </div>
      ) : (
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="font-mono font-semibold text-n-grn fade-up sens"
            style={{ fontSize: 38, letterSpacing: '-.025em', lineHeight: 1 }}
          >
            {fmt(salary)}
          </span>
          <button onClick={startEdit} className="btn-g btn-sm">Edit</button>
        </div>
      )}
    </div>
  )
}
