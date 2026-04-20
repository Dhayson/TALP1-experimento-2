import { v4 as uuidv4 } from 'uuid';
import { Student } from '../types/index';
import { StudentsDB } from '../services/dataStore';

const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCPF = (cpf: string): boolean => {
  return CPF_REGEX.test(cpf);
};

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const StudentModel = {
  getAll: (): Student[] => {
    return StudentsDB.getAll();
  },

  getById: (id: string): Student | undefined => {
    return StudentsDB.getAll().find(s => s.id === id);
  },

  getByCpf: (cpf: string): Student | undefined => {
    return StudentsDB.getAll().find(s => s.cpf === cpf);
  },

  create: (data: { name: string; cpf: string; email: string }): Student => {
    const students = StudentsDB.getAll();
    if (students.find(s => s.cpf === data.cpf)) {
      throw new Error('CPF already registered');
    }
    if (!validateCPF(data.cpf)) {
      throw new Error('Invalid CPF format');
    }
    if (!validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    const student: Student = {
      id: uuidv4(),
      name: data.name,
      cpf: data.cpf,
      email: data.email,
    };
    students.push(student);
    StudentsDB.saveAll(students);
    return student;
  },

  update: (id: string, data: Partial<{ name: string; cpf: string; email: string }>): Student => {
    const students = StudentsDB.getAll();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Student not found');
    }
    if (data.cpf && data.cpf !== students[index].cpf) {
      if (students.find(s => s.cpf === data.cpf)) {
        throw new Error('CPF already registered');
      }
      if (!validateCPF(data.cpf)) {
        throw new Error('Invalid CPF format');
      }
    }
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    students[index] = { ...students[index], ...data };
    StudentsDB.saveAll(students);
    return students[index];
  },

  delete: (id: string): void => {
    const students = StudentsDB.getAll();
    const filtered = students.filter(s => s.id !== id);
    StudentsDB.saveAll(filtered);
  },
};