import { v4 as uuidv4 } from 'uuid';
import { Class } from '../types/index';
import { ClassesDB } from '../services/dataStore';

export const ClassModel = {
  getAll: (): Class[] => {
    return ClassesDB.getAll();
  },

  getById: (id: string): Class | undefined => {
    return ClassesDB.getAll().find(c => c.id === id);
  },

  create: (data: { topic: string; year: number; semester: number }): Class => {
    const classes = ClassesDB.getAll();
    const classItem: Class = {
      id: uuidv4(),
      topic: data.topic,
      year: data.year,
      semester: data.semester,
      studentIds: [],
    };
    classes.push(classItem);
    ClassesDB.saveAll(classes);
    return classItem;
  },

  update: (id: string, data: Partial<{ topic: string; year: number; semester: number }>): Class => {
    const classes = ClassesDB.getAll();
    const index = classes.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Class not found');
    }
    classes[index] = { ...classes[index], ...data };
    ClassesDB.saveAll(classes);
    return classes[index];
  },

  delete: (id: string): void => {
    const classes = ClassesDB.getAll();
    ClassesDB.saveAll(classes.filter(c => c.id !== id));
  },

  addStudent: (classId: string, studentId: string): Class => {
    const classes = ClassesDB.getAll();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      throw new Error('Class not found');
    }
    if (!classes[index].studentIds.includes(studentId)) {
      classes[index].studentIds.push(studentId);
      ClassesDB.saveAll(classes);
    }
    return classes[index];
  },

  removeStudent: (classId: string, studentId: string): Class => {
    const classes = ClassesDB.getAll();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      throw new Error('Class not found');
    }
    classes[index].studentIds = classes[index].studentIds.filter(id => id !== studentId);
    ClassesDB.saveAll(classes);
    return classes[index];
  },
};