import { useState, useRef } from 'react'
import { useDb } from './useDb'
import IncomeSection     from './components/IncomeSection'
import OverviewBar       from './components/OverviewBar'
import ExpenseForm       from './components/ExpenseForm'
import CSVImport         from './components/CSVImport'
import CategoryBreakdown from './components/CategoryBreakdown'
import BudgetSection     from './components/BudgetSection'
import TransactionList   from './components/TransactionList'
import { EXP_CATS, CATEGORIES } from './categories'

export default function App() {
  const {
    ready,
    salary, saveSalary,
    transactions, addTransaction, updateTransaction, deleteTransaction, importTransactions,
    budgets, addBudget, deleteBudget,
    customCats, addCustomCat,
  } = useDb()

  const [editTx,  setEditTx]  = useState(null)
  const [privacy, setPrivacy] = useState(false)
  const formRef = useRef(null)

  const allExpCats = [...EXP_CATS, ...customCats]
  const allCats    = [...CATEGORIES, ...customCats]

  function addOrUpdate(data) {
    if (editTx) {
      updateTransaction({ ...editTx, ...data })
      setEditTx(null)
    } else {
      addTransaction({ ...data, id: crypto.randomUUID() })
    }
  }

  function startEdit(tx) {
    setEditTx(tx)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const month = new Date().toLocaleString('en-ZA', { month: 'long' }).toUpperCase()
  const year  = new Date().getFullYear()

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen gap-3">
      <div className="w-2 h-2 rounded-full bg-n-grn dot-pulse" />
      <p className="text-n-muted text-sm">Loading database…</p>
    </div>
  )

  return (
    <div className={`max-w-[920px] mx-auto px-4 py-8 pb-20 flex flex-col gap-4${privacy ? ' privacy' : ''}`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.03em] leading-tight">
            Budget<br />
            <span className="text-n-grn">Tracker</span>
          </h1>
          <p className="font-mono text-[10px] text-n-muted mt-2 tracking-[.1em]">
            {month} {year} · ZAR
          </p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => setPrivacy(p => !p)}
            title={privacy ? 'Show amounts' : 'Hide amounts'}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-[8px] border transition-all duration-150 ${
              privacy
                ? 'bg-n-grn/10 border-n-grn/40 text-n-grn'
                : 'bg-transparent border-n-bdr text-n-muted hover:border-n-bdr2 hover:text-n-tx'
            }`}
          >
            <span className="text-sm leading-none">{privacy ? '🙈' : '👁️'}</span>
            {privacy ? 'Show' : 'Hide'}
          </button>
          <div className="flex flex-col items-end">
            <div className="w-2 h-2 rounded-full bg-n-grn dot-pulse" />
            <span className="font-mono text-[9px] text-n-muted mt-1.5 tracking-[.1em]">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── 1. Context: what you have ── */}
      <div className="enter enter-1"><IncomeSection salary={salary} onSave={saveSalary} /></div>
      <div className="enter enter-2"><OverviewBar salary={salary} transactions={transactions} /></div>

      {/* ── 2. Plan + Analyse: side by side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 enter enter-3">
        <BudgetSection
          budgets={budgets}
          onAdd={addBudget}
          onDelete={deleteBudget}
          salary={salary}
          spent={transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)}
        />
        <CategoryBreakdown transactions={transactions} categories={allExpCats} />
      </div>

      {/* ── 3. Input: add manually ── */}
      <div className="enter enter-4">
        <ExpenseForm
          onAdd={addOrUpdate}
          editTx={editTx}
          onCancel={() => setEditTx(null)}
          formRef={formRef}
          categories={allExpCats}
          onAddCategory={addCustomCat}
        />
      </div>

      {/* ── 4. History ── */}
      <div className="enter enter-5">
        <TransactionList
          transactions={transactions}
          onEdit={startEdit}
          onDelete={deleteTransaction}
          categories={allCats}
        />
      </div>

      {/* ── 5. Import ── */}
      <div className="enter enter-6">
        <CSVImport onImport={rows => importTransactions(rows, salary)} />
      </div>
    </div>
  )
}
