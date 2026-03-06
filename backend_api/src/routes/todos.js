const express = require('express');
const todosController = require('../controllers/todos');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Todos
 *     description: Manage to-do tasks
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Buy milk
 *         is_completed:
 *           type: boolean
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     TodoCreateRequest:
 *       type: object
 *       required: [title]
 *       properties:
 *         title:
 *           type: string
 *           example: Walk the dog
 *     TodoUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Walk the dog (evening)
 *         is_completed:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: List todos
 *     description: List todos, optionally filtered by status.
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, completed]
 *           default: all
 *         description: Filter todos by completion state.
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 */
router.get('/', todosController.list.bind(todosController));

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoCreateRequest'
 *     responses:
 *       201:
 *         description: Created todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 */
router.post('/', todosController.create.bind(todosController));

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Get a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Not found
 */
router.get('/:id', todosController.get.bind(todosController));

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated todo
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
router.put('/:id', todosController.update.bind(todosController));

/**
 * @swagger
 * /todos/{id}/toggle:
 *   patch:
 *     summary: Toggle completion
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated todo
 *       404:
 *         description: Not found
 */
router.patch('/:id/toggle', todosController.toggleComplete.bind(todosController));

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', todosController.remove.bind(todosController));

module.exports = router;
