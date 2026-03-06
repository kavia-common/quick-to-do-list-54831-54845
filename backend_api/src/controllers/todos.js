const todosService = require('../services/todos');

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error('Invalid id parameter');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

class TodosController {
  // PUBLIC_INTERFACE
  async list(req, res, next) {
    /** List todos. Query: status=all|active|completed */
    try {
      const status = (req.query.status || 'all').toString();
      if (!['all', 'active', 'completed'].includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Invalid status query param' });
      }

      const todos = await todosService.list({ status });
      return res.status(200).json({ status: 'ok', data: todos });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async get(req, res, next) {
    /** Get a todo by id. */
    try {
      const id = parseId(req);
      const todo = await todosService.getById(id);
      if (!todo) return res.status(404).json({ status: 'error', message: 'Todo not found' });
      return res.status(200).json({ status: 'ok', data: todo });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async create(req, res, next) {
    /** Create todo. Body: { title: string } */
    try {
      const { title } = req.body || {};
      const todo = await todosService.create({ title });
      return res.status(201).json({ status: 'ok', data: todo });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async update(req, res, next) {
    /** Update todo. Body: { title?: string, is_completed?: boolean } */
    try {
      const id = parseId(req);

      const { title, is_completed } = req.body || {};
      if (is_completed !== undefined && typeof is_completed !== 'boolean') {
        return res.status(400).json({ status: 'error', message: 'is_completed must be boolean' });
      }

      const todo = await todosService.update(id, { title, is_completed });
      if (!todo) return res.status(404).json({ status: 'error', message: 'Todo not found' });

      return res.status(200).json({ status: 'ok', data: todo });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async toggleComplete(req, res, next) {
    /** Toggle completion state. */
    try {
      const id = parseId(req);
      const todo = await todosService.toggleComplete(id);
      if (!todo) return res.status(404).json({ status: 'error', message: 'Todo not found' });

      return res.status(200).json({ status: 'ok', data: todo });
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  async remove(req, res, next) {
    /** Delete todo by id. */
    try {
      const id = parseId(req);
      const deleted = await todosService.remove(id);
      if (!deleted) return res.status(404).json({ status: 'error', message: 'Todo not found' });

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TodosController();
