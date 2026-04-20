import fs from 'fs';
import path from 'path';
import { TestModel, ResultModel } from '../../server/src/models/test';

const TESTS_FILE = path.join(process.cwd(), 'server', 'src', 'data', 'tests.json');
const RESULTS_FILE = path.join(process.cwd(), 'server', 'src', 'data', 'results.json');

describe('Test Model', () => {
  afterEach(() => {
    if (fs.existsSync(TESTS_FILE)) fs.unlinkSync(TESTS_FILE);
    if (fs.existsSync(RESULTS_FILE)) fs.unlinkSync(RESULTS_FILE);
  });

  describe('TestModel', () => {
    test('getAll returns empty array initially', () => {
      expect(TestModel.getAll()).toEqual([]);
    });

    test('create adds a new test', () => {
      const test = TestModel.create('class-1', 'Test 1');
      expect(test.name).toBe('Test 1');
      expect(test.classId).toBe('class-1');
    });

    test('getByClassId returns tests for class', () => {
      TestModel.create('class-1', 'Test 1');
      TestModel.create('class-2', 'Test 2');
      const tests = TestModel.getByClassId('class-1');
      expect(tests.length).toBe(1);
      expect(tests[0].name).toBe('Test 1');
    });

    test('delete removes test', () => {
      const test = TestModel.create('class-1', 'Test 1');
      TestModel.delete(test.id);
      expect(TestModel.getById(test.id)).toBeUndefined();
    });
  });

  describe('ResultModel', () => {
    test('getAll returns empty array initially', () => {
      expect(ResultModel.getAll()).toEqual([]);
    });

    test('setResult creates new result', () => {
      const result = ResultModel.setResult('student-1', 'test-1', 'MA');
      expect(result.goal).toBe('MA');
      expect(result.studentId).toBe('student-1');
    });

    test('setResult updates existing result', () => {
      ResultModel.setResult('student-1', 'test-1', 'MANA');
      const updated = ResultModel.setResult('student-1', 'test-1', 'MA');
      const all = ResultModel.getAll();
      const found = all.find(r => r.studentId === 'student-1' && r.testId === 'test-1');
      expect(found?.goal).toBe('MA');
    });

    test('getResult returns specific result', () => {
      ResultModel.setResult('student-1', 'test-1', 'MANA');
      const result = ResultModel.getResult('student-1', 'test-1');
      expect(result?.goal).toBe('MANA');
    });

    test('removeResult deletes result', () => {
      ResultModel.setResult('student-1', 'test-1', 'MA');
      ResultModel.removeResult('student-1', 'test-1');
      expect(ResultModel.getResult('student-1', 'test-1')).toBeUndefined();
    });

    test('setResult throws error for invalid goal', () => {
      expect(() => {
        ResultModel.setResult('student-1', 'test-1', 'INVALID');
      }).toThrow('Invalid goal');
    });

    test('setResult allows empty goal', () => {
      const result = ResultModel.setResult('student-1', 'test-1', '');
      expect(result.goal).toBe('');
    });
  });
});