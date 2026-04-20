import fs from 'fs';
import path from 'path';
import { StudentsDB, ClassesDB, TestsDB, ResultsDB, EmailTrackingDB } from '../../server/src/services/dataStore';

const TEST_DATA_DIR = path.join(process.cwd(), 'server', 'src', 'data');

describe('DataStore Service', () => {
  const testFiles = ['students.json', 'classes.json', 'tests.json', 'results.json', 'emailTracking.json'];

  afterEach(() => {
    testFiles.forEach(file => {
      const filePath = path.join(TEST_DATA_DIR, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('StudentsDB', () => {
    test('getAll returns empty array when no file exists', () => {
      const students = StudentsDB.getAll();
      expect(students).toEqual([]);
    });

    test('saveAll creates file and getAll retrieves data', () => {
      const testData = [{ id: '1', name: 'John', cpf: '123.456.789-00', email: 'john@test.com' }];
      StudentsDB.saveAll(testData);
      const students = StudentsDB.getAll();
      expect(students).toEqual(testData);
    });
  });

  describe('ClassesDB', () => {
    test('getAll returns empty array when no file exists', () => {
      const classes = ClassesDB.getAll();
      expect(classes).toEqual([]);
    });

    test('saveAll creates file and getAll retrieves data', () => {
      const testData = [{ id: '1', topic: 'Math', year: 2026, semester: 1, studentIds: [] }];
      ClassesDB.saveAll(testData);
      const classes = ClassesDB.getAll();
      expect(classes).toEqual(testData);
    });
  });

  describe('TestsDB', () => {
    test('getAll returns empty array when no file exists', () => {
      const tests = TestsDB.getAll();
      expect(tests).toEqual([]);
    });

    test('saveAll creates file and getAll retrieves data', () => {
      const testData = [{ id: '1', classId: 'class1', name: 'Test 1' }];
      TestsDB.saveAll(testData);
      const tests = TestsDB.getAll();
      expect(tests).toEqual(testData);
    });
  });

  describe('ResultsDB', () => {
    test('getAll returns empty array when no file exists', () => {
      const results = ResultsDB.getAll();
      expect(results).toEqual([]);
    });

    test('saveAll creates file and getAll retrieves data', () => {
      const testData = [{ id: '1', studentId: 's1', testId: 't1', goal: 'MA', date: '2026-01-01' }];
      ResultsDB.saveAll(testData);
      const results = ResultsDB.getAll();
      expect(results).toEqual(testData);
    });
  });

  describe('EmailTrackingDB', () => {
    test('get returns default tracking when no file exists', () => {
      const tracking = EmailTrackingDB.get();
      expect(tracking).toEqual({ lastSentDate: '', changes: [] });
    });

    test('addChange adds a change to tracking', () => {
      const change = { id: '1', studentId: 's1', classId: 'c1', testId: 't1', oldGoal: '', newGoal: 'MA', timestamp: '2026-01-01T12:00:00Z' };
      EmailTrackingDB.addChange(change);
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes).toHaveLength(1);
      expect(tracking.changes[0]).toEqual(change);
    });

    test('clearChanges resets changes and sets lastSentDate', () => {
      const change = { id: '1', studentId: 's1', classId: 'c1', testId: 't1', oldGoal: '', newGoal: 'MA', timestamp: '2026-01-01T12:00:00Z' };
      EmailTrackingDB.addChange(change);
      EmailTrackingDB.clearChanges();
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes).toHaveLength(0);
      expect(tracking.lastSentDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });
});