import fs from 'fs';
import path from 'path';
import { StudentModel, validateCPF, validateEmail } from '../../server/src/models/student';

const TEST_DATA_FILE = path.join(process.cwd(), 'server', 'src', 'data', 'students.json');

describe('Student Model', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  });

  describe('validateCPF', () => {
    test('returns true for valid CPF format', () => {
      expect(validateCPF('123.456.789-00')).toBe(true);
    });

    test('returns false for invalid CPF', () => {
      expect(validateCPF('invalid')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    test('returns false for invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
    });
  });

  describe('CRUD operations', () => {
    test('getAll returns empty array initially', () => {
      expect(StudentModel.getAll()).toEqual([]);
    });

    test('create adds a new student', () => {
      const student = StudentModel.create({
        name: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john@example.com',
      });
      expect(student.name).toBe('John Doe');
    });

    test('getById returns student after creation', () => {
      const created = StudentModel.create({
        name: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john@example.com',
      });
      expect(StudentModel.getById(created.id)?.name).toBe('John Doe');
    });

    test('update modifies existing student', () => {
      const created = StudentModel.create({
        name: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john@example.com',
      });
      const updated = StudentModel.update(created.id, { name: 'Jane Doe' });
      expect(updated.name).toBe('Jane Doe');
    });

    test('delete removes student', () => {
      const created = StudentModel.create({
        name: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john@example.com',
      });
      StudentModel.delete(created.id);
      expect(StudentModel.getById(created.id)).toBeUndefined();
    });

    test('create throws error for invalid CPF', () => {
      expect(() => {
        StudentModel.create({ name: 'John', cpf: 'invalid', email: 'a@b.com' });
      }).toThrow('Invalid CPF format');
    });

    test('create throws error for invalid email', () => {
      expect(() => {
        StudentModel.create({ name: 'John', cpf: '123.456.789-00', email: 'invalid' });
      }).toThrow('Invalid email format');
    });

    test('create throws error for duplicate CPF', () => {
      StudentModel.create({ name: 'John', cpf: '123.456.789-00', email: 'a@b.com' });
      expect(() => {
        StudentModel.create({ name: 'Jane', cpf: '123.456.789-00', email: 'b@c.com' });
      }).toThrow('CPF already registered');
    });
  });
});