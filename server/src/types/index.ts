export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

export interface Class {
  id: string;
  topic: string;
  year: number;
  semester: number;
  studentIds: string[];
}

export interface Test {
  id: string;
  classId: string;
  name: string;
}

export interface TestResult {
  id: string;
  studentId: string;
  testId: string;
  goal: 'MANA' | 'MPA' | 'MA' | '';
  date: string;
}

export interface EmailChange {
  id: string;
  studentId: string;
  classId: string;
  testId: string;
  oldGoal: string;
  newGoal: string;
  timestamp: string;
}

export interface EmailTracking {
  lastSentDate: string;
  changes: EmailChange[];
}