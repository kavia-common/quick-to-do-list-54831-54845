const { execute, queryAll, queryOne, mapTodoRow } = require('../db/sqlite');

function nowIso() {
  return new Date().toISOString();
}

class TodosService {
  // PUBLIC_INTERFACE
  async list({ status } = {}) {
    /** List todos optionally filtered by status: 'all' | 'active' | 'completed'. */
    let where = '';
    const params = [];

    if (status === 'active') {
      where = 'WHERE is_completed = ?';
      params.push(0);
    } else if (status === 'completed') {
      where = 'WHERE is_completed = ?';
      params.push(1);
    }

    const rows = await queryAll(
      `SELECT id, title, is_completed, created_at, updated_at
       FROM todos
       ${where}
       ORDER BY id DESC`,
      params
    );

    return rows.map(mapTodoRow);
  }

  // PUBLIC_INTERFACE
  async getById(id) {
    /** Fetch a single todo by id (number). Returns todo or null. */
    const row = await queryOne(
      `SELECT id, title, is_completed, created_at, updated_at
       FROM todos
       WHERE id = ?`,
      [id]
    );
    return row ? mapTodoRow(row) : null;
  }

  // PUBLIC_INTERFACE
  async create({ title }) {
    /** Create a todo. */
    const trimmed = (title || '').trim();
    if (!trimmed) {
      const err = new Error('Title is required');
      err.statusCode = 400;
      throw err;
    }

    const createdAt = nowIso();
    const updatedAt = createdAt;

    const result = await execute(
      `INSERT INTO todos (title, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [trimmed, 0, createdAt, updatedAt]
    );

    return this.getById(result.lastID);
  }

  // PUBLIC_INTERFACE
  async update(id, { title, is_completed }) {
    /** Update a todo; supports title and/or is_completed. Returns updated todo or null if missing. */
    const existing = await this.getById(id);
    if (!existing) return null;

    const fields = [];
    const params = [];

    if (title !== undefined) {
      const trimmed = (title || '').trim();
      if (!trimmed) {
        const err = new Error('Title must be a non-empty string');
        err.statusCode = 400;
        throw err;
      }
      fields.push('title = ?');
      params.push(trimmed);
    }

    if (is_completed !== undefined) {
      const normalized = is_completed ? 1 : 0;
      fields.push('is_completed = ?');
      params.push(normalized);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push('updated_at = ?');
    params.push(nowIso());

    params.push(id);

    await execute(
      `UPDATE todos
       SET ${fields.join(', ')}
       WHERE id = ?`,
      params
    );

    return this.getById(id);
  }

  // PUBLIC_INTERFACE
  async toggleComplete(id) {
    /** Toggle completion state. Returns updated todo or null if missing. */
    const existing = await this.getById(id);
    if (!existing) return null;

    const newValue = existing.is_completed ? 0 : 1;
    await execute(
      `UPDATE todos
       SET is_completed = ?, updated_at = ?
       WHERE id = ?`,
      [newValue, nowIso(), id]
    );

    return this.getById(id);
  }

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Delete a todo. Returns true if deleted, false if not found. */
    const result = await execute('DELETE FROM todos WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = new TodosService();
