import { Router } from 'express';
import { ClassModel, StudentModel } from '../models/index';

const router = Router();

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get('/', (req, res) => {
  const classes = ClassModel.getAll();
  res.json(classes);
});

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get a class by ID with students
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class with students
 *       404:
 *         description: Class not found
 */
router.get('/:id', (req, res) => {
  const classItem = ClassModel.getById(req.params.id);
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  const students = classItem.studentIds
    .map(id => StudentModel.getById(id))
    .filter(s => s !== undefined);
  res.json({ ...classItem, students });
});

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - year
 *               - semester
 *             properties:
 *               topic:
 *                 type: string
 *               year:
 *                 type: number
 *               semester:
 *                 type: number
 *     responses:
 *       201:
 *         description: Class created
 */
router.post('/', (req, res) => {
  try {
    const { topic, year, semester } = req.body;
    if (!topic || !year || semester === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const classItem = ClassModel.create({ topic, year, semester });
    res.status(201).json(classItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class updated
 */
router.put('/:id', (req, res) => {
  try {
    const { topic, year, semester } = req.body;
    const classItem = ClassModel.update(req.params.id, { topic, year, semester });
    res.json(classItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Class deleted
 */
router.delete('/:id', (req, res) => {
  try {
    ClassModel.delete(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{id}/students/{studentId}:
 *   post:
 *     summary: Add a student to a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student added
 */
router.post('/:id/students/:studentId', (req, res) => {
  try {
    const classItem = ClassModel.addStudent(req.params.id, req.params.studentId);
    res.json(classItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove a student from a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student removed
 */
router.delete('/:id/students/:studentId', (req, res) => {
  try {
    const classItem = ClassModel.removeStudent(req.params.id, req.params.studentId);
    res.json(classItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;