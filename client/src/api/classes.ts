import api from './client';

export interface Class {
  id: string;
  topic: string;
  year: number;
  semester: number;
}

export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

export interface Test {
  id: string;
  name: string;
  classId: string;
}

export interface Result {
  studentId: string;
  testId: string;
  goal: string;
}

export const getClasses = () => api.get<Class[]>('/api/classes').then(res => res.data);

export const getClass = (id: string) => api.get<Class>(`/api/classes/${id}`).then(res => res.data);

export const createClass = (data: Omit<Class, 'id'>) => api.post<Class>('/api/classes', data).then(res => res.data);

export const updateClass = (id: string, data: Partial<Class>) => api.put<Class>(`/api/classes/${id}`, data).then(res => res.data);

export const deleteClass = (id: string) => api.delete(`/api/classes/${id}`);

export const getClassStudents = (id: string) => api.get<{ students: Student[] }>(`/api/classes/${id}`).then(res => res.data.students);

export const getClassTests = (id: string) => api.get<Test[]>(`/api/classes/${id}/tests`).then(res => res.data);

export const createClassTest = (classId: string, name: string) => api.post<Test>(`/api/classes/${classId}/tests`, { name }).then(res => res.data);

export const deleteClassTest = (classId: string, testId: string) => api.delete(`/api/classes/${classId}/tests/${testId}`);

export const getClassResults = (classId: string) => api.get<{ tests: Test[]; data: Array<{ student: Student; results: Record<string, string> }> }>(`/api/classes/${classId}/results`).then(res => res.data);

export const setClassResult = (classId: string, studentId: string, testId: string, goal: string) =>
  api.post(`/api/classes/${classId}/results`, { studentId, testId, goal });

export const deleteClassResult = (classId: string, studentId: string, testId: string) =>
  api.delete(`/api/classes/${classId}/results?studentId=${studentId}&testId=${testId}`);

export const enrollStudent = (classId: string, studentId: string) =>
  api.post(`/api/classes/${classId}/students/${studentId}`);

export const unenrollStudent = (classId: string, studentId: string) =>
  api.delete(`/api/classes/${classId}/students/${studentId}`);