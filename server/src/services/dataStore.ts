import fs from 'fs';
import path from 'path';
import { Student, Class, Test, TestResult, EmailChange, EmailTracking } from '../types/index';

const DATA_DIR = path.join(process.cwd(), 'server', 'src', 'data');

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readJson = <T>(filename: string, defaultValue: T): T => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return data ? JSON.parse(data) : defaultValue;
};

const writeJson = <T>(filename: string, data: T): void => {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const StudentsDB = {
  getAll: (): Student[] => readJson('students.json', []),
  saveAll: (students: Student[]): void => writeJson('students.json', students),
};

export const ClassesDB = {
  getAll: (): Class[] => readJson('classes.json', []),
  saveAll: (classes: Class[]): void => writeJson('classes.json', classes),
};

export const TestsDB = {
  getAll: (): Test[] => readJson('tests.json', []),
  saveAll: (tests: Test[]): void => writeJson('tests.json', tests),
};

export const ResultsDB = {
  getAll: (): TestResult[] => readJson('results.json', []),
  saveAll: (results: TestResult[]): void => writeJson('results.json', results),
};

export const EmailTrackingDB = {
  get: (): EmailTracking => readJson('emailTracking.json', { lastSentDate: '', changes: [] }),
  save: (tracking: EmailTracking): void => writeJson('emailTracking.json', tracking),
  addChange: (change: EmailChange): void => {
    const tracking = EmailTrackingDB.get();
    tracking.changes.push(change);
    EmailTrackingDB.save(tracking);
  },
  clearChanges: (): void => {
    const tracking = EmailTrackingDB.get();
    tracking.lastSentDate = new Date().toISOString().split('T')[0];
    tracking.changes = [];
    EmailTrackingDB.save(tracking);
  },
  getChangesSince: (date: string): EmailChange[] => {
    const tracking = EmailTrackingDB.get();
    if (!date) return tracking.changes;
    return tracking.changes.filter(c => c.timestamp.split('T')[0] === date);
  },
};