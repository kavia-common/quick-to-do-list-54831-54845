const path = require('path');
const sqlite3 = require('sqlite3').verbose();

/**
 * Resolve the SQLite database file path.
 * Prefer SQLITE_DB env var, otherwise fall back to a local app.db in the repo.
 */
function resolveDbPath() {
  const configured = process.env.SQLITE_DB;

  if (configured && configured.trim()) {
    // SQLITE_DB may be quoted in env files; strip wrapping quotes if present.
    return configured.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }

  // Fallback for local dev (should be overridden in .env in real environments)
  return path.join(process.cwd(), 'app.db');
}

const dbPath = resolveDbPath();

// Single shared connection. For SQLite in Node, a single connection is typical for small apps.
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to connect to SQLite at ${dbPath}`, err);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`Connected to SQLite at ${dbPath}`);
});

/**
 * Convert any SQLite row fields to API-friendly shapes (e.g., ints to booleans).
 */
function mapTodoRow(row) {
  if (!row) return row;
  return {
    ...row,
    is_completed: Boolean(row.is_completed),
  };
}

// PUBLIC_INTERFACE
function queryOne(sql, params = []) {
  /** Execute a query that returns a single row (or null). */
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// PUBLIC_INTERFACE
function queryAll(sql, params = []) {
  /** Execute a query that returns multiple rows. */
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// PUBLIC_INTERFACE
function execute(sql, params = []) {
  /** Execute a statement (INSERT/UPDATE/DELETE). Resolves with { lastID, changes }. */
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  dbPath,
  execute,
  queryAll,
  queryOne,
  mapTodoRow,
};
