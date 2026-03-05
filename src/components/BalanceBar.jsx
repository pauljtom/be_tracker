export default function BalanceBar({ salary, spent }) {
  const balance = salary - spent
  const pct = salary > 0 ? Math.min((spent / salary) * 100, 100) : 0
  const fmt = n => `R ${Math.abs(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  const barColor =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-amber-500' :
    'bg-emerald-500'

  const pctColor =
    pct >= 90 ? 'text-red-400' :
    pct >= 70 ? 'text-amber-400' :
    'text-emerald-400'

  return (
    <div className="bg-gray-800 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Spent</p>
          <p className="text-xl font-bold text-orange-400">{fmt(spent)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance</p>
          <p className={`text-xl font-bold ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {balance < 0 ? '-' : ''}{fmt(balance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">% Used</p>
          <p className={`text-xl font-bold ${pctColor}`}>{pct.toFixed(1)}%</p>
        </div>
      </div>
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        {pct >= 70 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-amber-400 opacity-60"
            style={{ left: '70%' }}
          />
        )}
        {pct >= 90 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-red-400 opacity-60"
            style={{ left: '90%' }}
          />
        )}
      </div>
      {salary === 0 && (
        <p className="text-xs text-gray-500 text-center">Set your monthly income above to see budget usage</p>
      )}
    </div>
  )
}
