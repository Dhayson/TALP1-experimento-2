import { Router } from 'express';
import { TestModel, ResultModel } from '../models/index';
import { ClassModel, StudentModel } from '../models/index';
import { trackChange } from '../services/emailService';

const router = Router();

/**
 * @swagger
 * /api/classes/{classId}/tests:
 *   get:
 *     summary: Get all tests for a class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tests
 */
router.get('/:classId/tests', (req, res) => {
  const tests = TestModel.getByClassId(req.params.classId);
  res.json(tests);
});

/**
 * @swagger
 * /api/classes/{classId}/tests:
 *   post:
 *     summary: Create a new test for a class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test created
 */
router.post('/:classId/tests', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing test name' });
    }
    const test = TestModel.create(req.params.classId, name);
    res.status(201).json(test);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{classId}/tests/{testId}:
 *   delete:
 *     summary: Delete a test
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *       - in: path
 *         name: testId
 *         required: true
 *     responses:
 *       204:
 *         description: Test deleted
 */
router.delete('/:classId/tests/:testId', (req, res) => {
  try {
    TestModel.delete(req.params.testId);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{classId}/results:
 *   get:
 *     summary: Get all test results for a class
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test results table
 */
router.get('/:classId/results', (req, res) => {
  const classItem = ClassModel.getById(req.params.classId);
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  const tests = TestModel.getByClassId(req.params.classId);
  const results = ResultModel.getByClassId(req.params.classId);

  const data = classItem.studentIds.map(studentId => {
    const student = StudentModel.getById(studentId);
    if (!student) return null;
    const studentResults: Record<string, string> = {};
    for (const test of tests) {
      const result = results.find(r => r.studentId === studentId && r.testId === test.id);
      studentResults[test.id] = result?.goal || '';
    }
    return { student, results: studentResults };
  }).filter(Boolean);

  res.json({ tests, data });
});

/**
 * @swagger
 * /api/classes/{classId}/results:
 *   post:
 *     summary: Set or update a test result
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - testId
 *             properties:
 *               studentId:
 *                 type: string
 *               testId:
 *                 type: string
 *               goal:
 *                 type: string
 *                 enum: [MANA, MPA, MA, ""]
 *     responses:
 *       201:
 *         description: Result set
 */
router.post('/:classId/results', (req, res) => {
  try {
    const { studentId, testId, goal } = req.body;
    if (!studentId || !testId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = ResultModel.getResult(studentId, testId);
    const oldGoal = existing?.goal || '';
    const newGoal = goal || '';
    const result = ResultModel.setResult(studentId, testId, newGoal);
    trackChange(studentId, req.params.classId, testId, oldGoal, newGoal);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/classes/{classId}/results/{resultId}:
 *   delete:
 *     summary: Delete a test result
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *       - in: path
 *         name: resultId
 *         required: true
 *     responses:
 *       204:
 *         description: Result deleted
 */
router.delete('/:classId/results/:resultId', (req, res) => {
  try {
    ResultModel.delete(req.params.resultId);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:classId/results', (req, res) => {
  try {
    const { studentId, testId } = req.query;
    if (!studentId || !testId) {
      return res.status(400).json({ error: 'Missing studentId or testId' });
    }
    ResultModel.removeResult(studentId as string, testId as string);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;