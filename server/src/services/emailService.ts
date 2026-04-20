import { v4 as uuidv4 } from 'uuid';
import { Student, EmailChange, EmailTracking } from '../types/index';
import { EmailTrackingDB, StudentsDB } from '../services/dataStore';
import { TestModel } from '../models/test';
import { ClassModel } from '../models/class';

export const trackChange = (
  studentId: string,
  classId: string,
  testId: string,
  oldGoal: string,
  newGoal: string
): void => {
  if (!oldGoal && !newGoal) return;
  const change: EmailChange = {
    id: uuidv4(),
    studentId,
    classId,
    testId,
    oldGoal,
    newGoal,
    timestamp: new Date().toISOString(),
  };
  EmailTrackingDB.addChange(change);
};

export const sendDailyEmails = async (): Promise<void> => {
  const tracking = EmailTrackingDB.get();
  const today = new Date().toISOString().split('T')[0];

  const changesByStudent = new Map<string, EmailChange[]>();
  for (const change of tracking.changes) {
    const existing = changesByStudent.get(change.studentId) || [];
    existing.push(change);
    changesByStudent.set(change.studentId, existing);
  }

  const students = StudentsDB.getAll();
  for (const [studentId, changes] of changesByStudent) {
    const student = students.find(s => s.id === studentId);
    if (!student) continue;

    const emailLines = [`To: ${student.email}`, `Student: ${student.name}`, '', 'Changes today:', ''];
    const classMap = new Map<string, string[]>();

    for (const change of changes) {
      const classItem = ClassModel.getById(change.classId);
      const test = TestModel.getById(change.testId);
      const className = classItem?.topic || 'Unknown';
      const testName = test?.name || 'Unknown';

      const key = className;
      const lines = classMap.get(key) || [];
      lines.push(`  ${testName}: ${change.oldGoal || '(empty)'} -> ${change.newGoal}`);
      classMap.set(key, lines);
    }

    for (const [className, lines] of classMap) {
      emailLines.push(`Class: ${className}`);
      emailLines.push(...lines);
      emailLines.push('');
    }

    console.log('=== EMAIL ===');
    console.log(emailLines.join('\n'));
    console.log('=============');
  }

  EmailTrackingDB.clearChanges();
};

export const checkAndSendDailyEmail = async (): Promise<void> => {
  const tracking = EmailTrackingDB.get();
  const today = new Date().toISOString().split('T')[0];

  if (tracking.changes.length > 0 && tracking.lastSentDate !== today) {
    await sendDailyEmails();
  }
};