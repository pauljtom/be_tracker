import * as _sqljs from 'sql.js'
const initSqlJs = _sqljs.default ?? _sqljs

let _db = null

// ── IndexedDB helpers ────────────────────────────────────────────

const IDB_NAME  = 'be_tracker'
const IDB_STORE = 'dbfile'

function openIDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE)
    req.onsuccess = e => res(e.target.result)
    req.onerror   = e => rej(e.target.error)
  })
}

async function idbLoad() {
  const idb = await openIDB()
  return new Promise((res, rej) => {
    const tx  = idb.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get('main')
    req.onsuccess = () => res(req.result ?? null)
    req.onerror   = () => rej(req.error)
  })
}

async function idbSave(data) {
  const idb = await openIDB()
  return new Promise((res, rej) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(data, 'main')
    tx.oncomplete = res
    tx.onerror    = () => rej(tx.error)
  })
}

function persist() {
  idbSave(_db.export()).catch(console.error)
}

// ── Helpers ───────────────────────────────────────────────────────

function rowsToObjs(res) {
  if (!res[0]) return []
  const { columns, values } = res[0]
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])))
}

// ── Init ──────────────────────────────────────────────────────────

export async function initDb() {
  const SQL   = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })
  const saved = await idbLoad()
  _db = saved ? new SQL.Database(saved) : new SQL.Database()

  _db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    )
  `)
  _db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount      REAL NOT NULL,
      category    TEXT NOT NULL,
      date        TEXT NOT NULL,
      type        TEXT NOT NULL
    )
  `)
  _db.run(`
    CREATE TABLE IF NOT EXISTS custom_cats (
      id    TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      icon  TEXT NOT NULL,
      color TEXT NOT NULL,
      ord   INTEGER DEFAULT 0
    )
  `)
  _db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id     TEXT PRIMARY KEY,
      name   TEXT NOT NULL,
      amount REAL NOT NULL
    )
  `)
}

// ── Settings ──────────────────────────────────────────────────────

export function getSalary() {
  const r = _db.exec('SELECT value FROM settings WHERE key = ?', ['salary'])
  return parseFloat(r[0]?.values[0]?.[0] ?? '0') || 0
}

export function saveSalary(val) {
  _db.run('INSERT OR REPLACE INTO settings VALUES (?,?)', ['salary', String(val)])
  persist()
}

// ── Transactions ──────────────────────────────────────────────────

export function getTransactions() {
  return rowsToObjs(_db.exec('SELECT * FROM transactions ORDER BY date DESC, rowid DESC'))
    .map(t => ({ ...t, amount: Number(t.amount) }))
}

export function insertTransaction(tx) {
  _db.run(
    'INSERT INTO transactions VALUES (?,?,?,?,?,?)',
    [tx.id, tx.description, tx.amount, tx.category, tx.date, tx.type]
  )
  persist()
}

export function updateTransaction(tx) {
  _db.run(
    'UPDATE transactions SET description=?, amount=?, category=?, date=?, type=? WHERE id=?',
    [tx.description, tx.amount, tx.category, tx.date, tx.type, tx.id]
  )
  persist()
}

export function deleteTransaction(id) {
  _db.run('DELETE FROM transactions WHERE id = ?', [id])
  persist()
}

export function insertTransactions(txs) {
  const stmt = _db.prepare('INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?)')
  for (const tx of txs) {
    stmt.run([tx.id, tx.description, tx.amount, tx.category, tx.date, tx.type])
  }
  stmt.free()
  persist()
}

// ── Budgets ───────────────────────────────────────────────────────

export function getBudgets() {
  return rowsToObjs(_db.exec('SELECT * FROM budgets ORDER BY rowid'))
    .map(b => ({ ...b, amount: Number(b.amount) }))
}

export function insertBudget(b) {
  _db.run('INSERT INTO budgets VALUES (?,?,?)', [b.id, b.name, b.amount])
  persist()
}

export function deleteBudget(id) {
  _db.run('DELETE FROM budgets WHERE id = ?', [id])
  persist()
}

// ── Custom categories ─────────────────────────────────────────────

export function getCustomCats() {
  return rowsToObjs(_db.exec('SELECT * FROM custom_cats ORDER BY ord'))
}

export function insertCustomCat(cat) {
  const count = _db.exec('SELECT COUNT(*) FROM custom_cats')[0].values[0][0]
  _db.run(
    'INSERT INTO custom_cats VALUES (?,?,?,?,?)',
    [cat.id, cat.label, cat.icon, cat.color, count]
  )
  persist()
}
