import { useRef, useState } from 'react'
import { parseCSV, fmt } from '../utils'
import { getCat } from '../categories'

export default function CSVImport({ onImport }) {
  const [drag,    setDrag]    = useState(false)
  const [preview, setPreview] = useState(null)
  const [filter,  setFilter]  = useState('all')
  const fileRef = useRef()

  function load(file) {
    const reader = new FileReader()
    reader.onload = e => { setPreview(parseCSV(e.target.result)); setFilter('all') }
    reader.readAsText(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) load(f)
  }

  function confirm() {
    if (preview) { onImport(preview); setPreview(null) }
  }

  const expenses = preview?.filter(r => r.type === 'expense') ?? []
  const incomes  = preview?.filter(r => r.type === 'income')  ?? []
  const shown    = filter === 'expense' ? expenses
                 : filter === 'income'  ? incomes
                 : (preview ?? [])

  return (
    <>
      {/* ── Drop card ── */}
      <div className="card">
        <p className="lbl mb-3.5">Import CSV</p>
        <div
          className={`drop-zone${drag ? ' dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
        >
          <div className="text-3xl mb-2 select-none">📄</div>
          <p className="text-sm font-semibold text-n-sub mb-0.5">Drop CSV file here</p>
          <p className="text-xs text-n-muted">or click to browse</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => {
              const f = e.target.files[0]
              if (f) load(f)
              e.target.value = ''
            }}
          />
        </div>
        <p className="text-[11px] text-n-muted mt-3 leading-relaxed">
          Expects:{' '}
          <span className="font-mono text-n-sub text-[10px]">
            Transaction Date · Description · Parent Category · Category · Money In · Money Out
          </span>
        </p>
      </div>

      {/* ── Preview modal ── */}
      {preview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div
            className="bg-n-card border border-n-bdr2 rounded-[20px] w-full max-w-[780px] max-h-[88vh] flex flex-col"
            style={{ boxShadow: '0 32px 96px rgba(0,0,0,.7)' }}
          >
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-n-bdr flex-none">
              <p className="text-[15px] font-bold mb-3">
                Import Preview —{' '}
                <span className="font-mono text-n-grn">{preview.length}</span> rows
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  ['all',     `All (${preview.length})`],
                  ['expense', `Expenses (${expenses.length})`],
                  ['income',  `Income (${incomes.length})`],
                ].map(([f, label]) => (
                  <button
                    key={f}
                    className={`pill${filter === f ? ' on' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-y-auto overflow-x-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-n-card">
                  <tr className="border-b border-n-bdr">
                    {[
                      { h: 'Date',        cls: 'text-left' },
                      { h: 'Description', cls: 'text-left' },
                      { h: 'Category',    cls: 'text-left hidden sm:table-cell' },
                      { h: 'Amount',      cls: 'text-right' },
                    ].map(({ h, cls }) => (
                      <th
                        key={h}
                        className={`px-2 py-2 sm:px-4 sm:py-2.5 text-[10px] font-bold tracking-[.12em] uppercase text-n-muted ${cls}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map(row => {
                    const c = getCat(row.category)
                    return (
                      <tr key={row.id} className="border-b border-n-bdr/40 hover:bg-n-card2">
                        <td className="px-2 py-2 sm:px-4 sm:py-2.5">
                          <span className="font-mono text-[11px] text-n-sub whitespace-nowrap">{row.date}</span>
                        </td>
                        <td className="px-2 py-2 sm:px-4 sm:py-2.5 text-sm text-n-tx max-w-[140px] sm:max-w-[220px] truncate">
                          {row.description}
                        </td>
                        <td className="px-2 py-2 sm:px-4 sm:py-2.5 text-sm text-n-sub whitespace-nowrap hidden sm:table-cell">
                          {c.icon} {c.label}
                        </td>
                        <td className="px-2 py-2 sm:px-4 sm:py-2.5 text-right whitespace-nowrap">
                          <span className={`font-mono text-sm font-medium ${
                            row.type === 'income' ? 'text-n-grn' : 'text-n-red'
                          }`}>
                            {row.type === 'income' ? '+' : '−'}{fmt(row.amount)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {shown.length === 0 && (
                <p className="text-center py-8 text-n-muted text-sm">No rows to show</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-n-bdr flex-none flex justify-end gap-3">
              <button className="btn-g" onClick={() => setPreview(null)}>Cancel</button>
              <button className="btn-p" onClick={confirm}>
                Import {preview.length} transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
