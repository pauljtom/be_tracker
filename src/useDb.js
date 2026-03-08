import { useState, useEffect, useCallback } from 'react'
import * as DB from './db'
import { EXP_CATS } from './categories'

const CAT_PALETTE = [
  '#f472b6','#a78bfa','#60a5fa','#fb923c','#facc15',
  '#4ade80','#f87171','#818cf8','#e879f9','#38bdf8',
]

export function useDb() {
  const [ready,        setReady]        = useState(false)
  const [salary,       setSalaryState]  = useState(0)
  const [transactions, setTransactions] = useState([])
  const [customCats,   setCustomCats]   = useState([])
  const [budgets,      setBudgets]      = useState([])

  useEffect(() => {
    DB.initDb()
      .then(() => {
        setSalaryState(DB.getSalary())
        setTransactions(DB.getTransactions())
        setCustomCats(DB.getCustomCats())
        setBudgets(DB.getBudgets())
        setReady(true)
      })
      .catch(err => console.error('DB init failed:', err))
  }, [])

  const saveSalary = useCallback(val => {
    DB.saveSalary(val)
    setSalaryState(val)
  }, [])

  const addTransaction = useCallback(tx => {
    DB.insertTransaction(tx)
    setTransactions(prev => [tx, ...prev])
  }, [])

  const updateTransaction = useCallback(tx => {
    DB.updateTransaction(tx)
    setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))
  }, [])

  const deleteTransaction = useCallback(id => {
    DB.deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const importTransactions = useCallback((rows, currentSalary) => {
    DB.insertTransactions(rows)
    setTransactions(prev => {
      const existing = new Set(prev.map(t => t.id))
      return [...rows.filter(r => !existing.has(r.id)), ...prev]
    })
    const totalIn = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
    if (currentSalary === 0 && totalIn > 0) {
      DB.saveSalary(totalIn)
      setSalaryState(totalIn)
    }
  }, [])

  const addBudget = useCallback(b => {
    DB.insertBudget(b)
    setBudgets(prev => [...prev, b])
  }, [])

  const deleteBudget = useCallback(id => {
    DB.deleteBudget(id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }, [])

  const addCustomCat = useCallback(({ label, icon }) => {
    const color = CAT_PALETTE[DB.getCustomCats().length % CAT_PALETTE.length]
    const cat   = { id: `custom_${Date.now()}`, label, icon, color }
    DB.insertCustomCat(cat)
    setCustomCats(prev => [...prev, cat])
    return cat.id
  }, [])

  return {
    ready,
    salary, saveSalary,
    transactions, addTransaction, updateTransaction, deleteTransaction, importTransactions,
    budgets, addBudget, deleteBudget,
    customCats, addCustomCat,
  }
}
