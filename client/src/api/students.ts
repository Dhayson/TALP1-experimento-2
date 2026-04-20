import api from './client';

export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

export const getStudents = () => api.get<Student[]>('/api/students').then(res => res.data);

export const getStudent = (id: string) => api.get<Student>(`/api/students/${id}`).then(res => res.data);

export const createStudent = (data: Omit<Student, 'id'>) => api.post<Student>('/api/students', data).then(res => res.data);

export const updateStudent = (id: string, data: Partial<Student>) => api.put<Student>(`/api/students/${id}`, data).then(res => res.data);

export const deleteStudent = (id: string) => api.delete(`/api/students/${id}`);