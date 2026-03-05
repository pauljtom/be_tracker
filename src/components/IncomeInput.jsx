import { useState } from 'react'

export default function IncomeInput({ salary, onSave }) {
  const [editing, setEditing] = useState(!salary)
  const [val, setVal] = useState(salary ? String(salary) : '')

  const save = () => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) { onSave(n); setEditing(false) }
  }

  const handleKey = e => { if (e.key === 'Enter') save() }

  if (editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm font-medium">Monthly Income (ZAR)</span>
        <div className="flex gap-2">
          <input
            type="number"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={handleKey}
            placeholder="0.00"
            className="w-44 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-emerald-500"
            autoFocus
          />
          <button
            onClick={save}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
          >
            Set
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm font-medium">Monthly Income</span>
      <span className="text-emerald-400 font-bold text-lg">
        R {salary.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
      </span>
      <button
        onClick={() => { setVal(String(salary)); setEditing(true) }}
        className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
      >
        Edit
      </button>
    </div>
  )
}
