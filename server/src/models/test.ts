import { v4 as uuidv4 } from 'uuid';
import { Test, TestResult } from '../types/index';
import { TestsDB, ResultsDB } from '../services/dataStore';

const VALID_GOALS = ['MANA', 'MPA', 'MA', ''];

export const TestModel = {
  getAll: (): Test[] => {
    return TestsDB.getAll();
  },

  getByClassId: (classId: string): Test[] => {
    return TestsDB.getAll().filter(t => t.classId === classId);
  },

  getById: (id: string): Test | undefined => {
    return TestsDB.getAll().find(t => t.id === id);
  },

  create: (classId: string, name: string): Test => {
    const tests = TestsDB.getAll();
    const test: Test = {
      id: uuidv4(),
      classId,
      name,
    };
    tests.push(test);
    TestsDB.saveAll(tests);
    return test;
  },

  delete: (id: string): void => {
    const tests = TestsDB.getAll();
    TestsDB.saveAll(tests.filter(t => t.id !== id));
    const results = ResultsDB.getAll();
    ResultsDB.saveAll(results.filter(r => r.testId !== id));
  },
};

export const ResultModel = {
  getAll: (): TestResult[] => {
    return ResultsDB.getAll();
  },

  getByTestId: (testId: string): TestResult[] => {
    return ResultsDB.getAll().filter(r => r.testId === testId);
  },

  getByStudentId: (studentId: string): TestResult[] => {
    return ResultsDB.getAll().filter(r => r.studentId === studentId);
  },

  getByClassId: (classId: string): TestResult[] => {
    const tests = TestModel.getByClassId(classId);
    const testIds = tests.map(t => t.id);
    return ResultsDB.getAll().filter(r => testIds.includes(r.testId));
  },

  getResult: (studentId: string, testId: string): TestResult | undefined => {
    return ResultsDB.getAll().find(r => r.studentId === studentId && r.testId === testId);
  },

  setResult: (studentId: string, testId: string, goal: string): TestResult => {
    if (!VALID_GOALS.includes(goal)) {
      throw new Error('Invalid goal. Must be MANA, MPA, MA, or empty');
    }
    const results = ResultsDB.getAll();
    const existingIndex = results.findIndex(r => r.studentId === studentId && r.testId === testId);
    const now = new Date().toISOString();
    if (existingIndex !== -1) {
      results[existingIndex] = { ...results[existingIndex], goal: goal as TestResult['goal'], date: now };
      ResultsDB.saveAll(results);
      return results[existingIndex];
    }
    const result: TestResult = {
      id: uuidv4(),
      studentId,
      testId,
      goal: goal as TestResult['goal'],
      date: now,
    };
    results.push(result);
    ResultsDB.saveAll(results);
    return result;
  },

  delete: (id: string): void => {
    const results = ResultsDB.getAll();
    ResultsDB.saveAll(results.filter(r => r.id !== id));
  },

  removeResult: (studentId: string, testId: string): void => {
    const results = ResultsDB.getAll();
    ResultsDB.saveAll(results.filter(r => !(r.studentId === studentId && r.testId === testId)));
  },
};