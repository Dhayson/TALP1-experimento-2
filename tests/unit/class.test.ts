import fs from 'fs';
import path from 'path';
import { ClassModel } from '../../server/src/models/class';

const TEST_DATA_FILE = path.join(process.cwd(), 'server', 'src', 'data', 'classes.json');

describe('Class Model', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  });

  describe('CRUD operations', () => {
    test('getAll returns empty array initially', () => {
      expect(ClassModel.getAll()).toEqual([]);
    });

    test('create adds a new class', () => {
      const classItem = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      expect(classItem.topic).toBe('Math 101');
      expect(classItem.year).toBe(2026);
      expect(classItem.semester).toBe(1);
    });

    test('getById returns class after creation', () => {
      const created = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      expect(ClassModel.getById(created.id)?.topic).toBe('Math 101');
    });

    test('update modifies existing class', () => {
      const created = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      const updated = ClassModel.update(created.id, { topic: 'Advanced Math' });
      expect(updated.topic).toBe('Advanced Math');
    });

    test('delete removes class', () => {
      const created = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      ClassModel.delete(created.id);
      expect(ClassModel.getById(created.id)).toBeUndefined();
    });
  });

  describe('Student management', () => {
    test('class starts with empty studentIds', () => {
      const classItem = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      expect(classItem.studentIds).toEqual([]);
    });

    test('addStudent adds student to class', () => {
      const classItem = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      const updated = ClassModel.addStudent(classItem.id, 'student-1');
      expect(updated.studentIds).toContain('student-1');
    });

    test('removeStudent removes student from class', () => {
      const classItem = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      ClassModel.addStudent(classItem.id, 'student-1');
      const updated = ClassModel.removeStudent(classItem.id, 'student-1');
      expect(updated.studentIds).not.toContain('student-1');
    });

    test('addStudent does not duplicate', () => {
      const classItem = ClassModel.create({
        topic: 'Math 101',
        year: 2026,
        semester: 1,
      });
      ClassModel.addStudent(classItem.id, 'student-1');
      ClassModel.addStudent(classItem.id, 'student-1');
      const updated = ClassModel.getById(classItem.id);
      expect(updated?.studentIds.filter(s => s === 'student-1').length).toBe(1);
    });
  });
});