import { fmt } from '../utils'

export default function OverviewBar({ salary, transactions }) {
  const spent   = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = salary - spent
  const pct     = salary > 0 ? Math.min((spent / salary) * 100, 100) : 0

  const barColor = pct >= 90 ? '#f87171' : pct >= 70 ? '#fbbf24' : '#34d399'
  const pctCls   = pct >= 90 ? 'text-n-red' : pct >= 70 ? 'text-n-amb' : 'text-n-grn'
  const balCls   = balance >= 0 ? 'text-n-grn' : 'text-n-red'

  return (
    <div className="card">
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Spent',   val: fmt(spent),           cls: 'text-n-red' },
          { label: 'Balance', val: fmt(balance),          cls: balCls },
          { label: '% Used',  val: `${pct.toFixed(1)}%`, cls: pctCls },
        ].map(({ label, val, cls }) => (
          <div key={label} className="text-center min-w-0">
            <p className="lbl mb-2">{label}</p>
            <p
              className={`font-mono font-semibold fade-up sens truncate ${cls}`}
              style={{ fontSize: 'clamp(12px, 3.8vw, 22px)', letterSpacing: '-.02em', lineHeight: 1 }}
            >
              {val}
            </p>
          </div>
        ))}
      </div>

      <div className="h-[7px] bg-n-card2 rounded-full overflow-hidden">
        {pct > 0 && (
          <div
            className="h-full rounded-full prog-anim"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-1 mt-2">
        {salary === 0 ? (
          <span className="text-[11px] text-n-muted">
            Set your monthly income above to track budget usage
          </span>
        ) : (
          <>
            <span className="font-mono text-[10px] text-n-muted sens">{fmt(spent)} spent</span>
            <span className="font-mono text-[10px] text-n-muted sens">{fmt(salary - spent)} left</span>
          </>
        )}
      </div>
    </div>
  )
}
