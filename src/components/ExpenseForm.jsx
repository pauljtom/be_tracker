import { useState, useEffect, useRef } from 'react'
import { parseAmt, today } from '../utils'

const EMOJI_GRID = [
  '🏠','🏘️','🏢','🔑','🛒','🛍️','👔','👗','👟','👜',
  '🍔','🍕','🌮','🍣','☕','🍺','🥗','🧃','🍰','🍷',
  '🚗','🚌','✈️','🚂','⛽','🅿️','🛵','🚲','🛳️','🚁',
  '💡','📱','💻','📺','🖥️','📡','🎙️','🔌','🧯','🔑',
  '❤️','💊','🏥','🦷','💆','🏋️','🧘','🩺','🩹','🧬',
  '🎬','🎮','🎵','📚','🎓','🎯','⚽','🎭','🎨','🎲',
  '💰','💸','💳','🏦','📈','💎','🪙','📊','🧾','🏷️',
  '🐾','🌿','🌊','🌄','🎁','🔧','🧹','🌍','⚡','📦',
]

export default function ExpenseForm({ onAdd, editTx, onCancel, formRef, categories = [], onAddCategory }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('expense')
  const [desc, setDesc] = useState('')
  const [amt,  setAmt]  = useState('')
  const [cat,  setCat]  = useState('food')

  // New-category form state
  const [showCatForm, setShowCatForm] = useState(false)
  const [newEmoji,    setNewEmoji]    = useState('📦')
  const [newLabel,    setNewLabel]    = useState('')
  const labelRef = useRef(null)

  useEffect(() => {
    if (editTx) {
      setType(editTx.type)
      setDesc(editTx.description)
      setAmt(String(editTx.amount))
      setCat(editTx.category)
      setOpen(true)
    } else {
      setType('expense'); setDesc(''); setAmt(''); setCat('food')
    }
  }, [editTx])

  useEffect(() => {
    if (showCatForm) labelRef.current?.focus()
  }, [showCatForm])

  function submit() {
    const n = parseAmt(amt)
    if (!desc.trim() || !n) return
    onAdd({
      description: desc.trim(),
      amount: n,
      category: type === 'income' ? 'income' : cat,
      date: editTx?.date ?? today(),
      type,
    })
    setDesc(''); setAmt(''); setCat('food'); setType('expense')
  }

  function submitNewCat() {
    if (!newLabel.trim()) return
    const id = onAddCategory({ label: newLabel.trim(), icon: newEmoji })
    if (id) setCat(id)
    setNewLabel('')
    setNewEmoji('📦')
    setShowCatForm(false)
  }

  return (
    <div className="card" ref={formRef}>
      <button
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity mb-0"
        onClick={() => setOpen(o => !o)}
      >
        <p className="lbl">
          {editTx ? '✏️  Edit Transaction' : 'Add Transaction'}
        </p>
        <span className={`chevron${open ? ' open' : ''}`}>▼</span>
      </button>

      <div className={`collapsible${open ? ' open' : ''}`}><div>
      {/* Type selector */}
      <div className="flex gap-2 mb-3.5 mt-3.5">
        <button
          className={`type-tab exp${type === 'expense' ? ' on' : ''}`}
          onClick={() => setType('expense')}
        >
          − Expense
        </button>
        <button
          className={`type-tab inc${type === 'income' ? ' on' : ''}`}
          onClick={() => setType('income')}
        >
          + Income
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <input
          className="field"
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <input
          className="field font-mono"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount (ZAR)"
          value={amt}
          onChange={e => setAmt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />

        {type === 'expense' && (
          <>
            <select className="field" value={cat} onChange={e => setCat(e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>

            {/* Add category toggle */}
            {!showCatForm ? (
              <button
                type="button"
                onClick={() => setShowCatForm(true)}
                className="self-start text-[11px] text-n-muted hover:text-n-grn transition-colors flex items-center gap-1"
              >
                <span className="text-base leading-none">+</span> Add category
              </button>
            ) : (
              <div className="rounded-[12px] border border-n-bdr bg-n-card2 p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="lbl">New Category</span>
                  <button
                    onClick={() => { setShowCatForm(false); setNewLabel(''); setNewEmoji('📦') }}
                    className="text-n-muted hover:text-n-tx text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Emoji grid */}
                <div className="grid grid-cols-10 gap-0.5 max-h-[140px] overflow-y-auto">
                  {EMOJI_GRID.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewEmoji(e)}
                      className={`text-base p-1 rounded-[6px] transition-colors leading-none hover:bg-n-surf ${
                        newEmoji === e ? 'bg-n-surf ring-1 ring-n-grn' : ''
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* Manual emoji + label row */}
                <div className="flex gap-2">
                  <input
                    className="field w-16 text-center text-lg px-2"
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    maxLength={4}
                    title="Or type any emoji"
                  />
                  <input
                    ref={labelRef}
                    className="field flex-1"
                    placeholder="Category name"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitNewCat()}
                  />
                  <button
                    type="button"
                    onClick={submitNewCat}
                    className="btn-p whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={submit} className="btn-p flex-1">
            {editTx ? 'Update Transaction' : 'Add Transaction'}
          </button>
          {editTx && (
            <button onClick={onCancel} className="btn-g">Cancel</button>
          )}
        </div>
      </div>
      </div></div>
    </div>
  )
}
