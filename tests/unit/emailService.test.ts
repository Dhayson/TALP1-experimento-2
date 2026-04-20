import fs from 'fs';
import path from 'path';
import { EmailTrackingDB } from '../../server/src/services/dataStore';
import { trackChange, sendDailyEmails } from '../../server/src/services/emailService';

const EMAIL_FILE = path.join(process.cwd(), 'server', 'src', 'data', 'emailTracking.json');

describe('Email Service', () => {
  afterEach(() => {
    if (fs.existsSync(EMAIL_FILE)) {
      fs.unlinkSync(EMAIL_FILE);
    }
  });

  describe('trackChange', () => {
    test('adds change when both old and new goals are empty', () => {
      trackChange('student-1', 'class-1', 'test-1', '', '');
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes.length).toBe(0);
    });

    test('adds change when new goal is set', () => {
      trackChange('student-1', 'class-1', 'test-1', '', 'MA');
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes.length).toBe(1);
      expect(tracking.changes[0].newGoal).toBe('MA');
    });

    test('adds change when goal is edited', () => {
      trackChange('student-1', 'class-1', 'test-1', 'MANA', 'MA');
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes.length).toBe(1);
      expect(tracking.changes[0].oldGoal).toBe('MANA');
      expect(tracking.changes[0].newGoal).toBe('MA');
    });

    test('tracks multiple changes for same student', () => {
      trackChange('student-1', 'class-1', 'test-1', '', 'MA');
      trackChange('student-1', 'class-1', 'test-2', '', 'MANA');
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes.length).toBe(2);
    });
  });

  describe('sendDailyEmails', () => {
    test('clears changes after sending', async () => {
      trackChange('student-1', 'class-1', 'test-1', '', 'MA');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await sendDailyEmails();
      const tracking = EmailTrackingDB.get();
      expect(tracking.changes.length).toBe(0);
      consoleSpy.mockRestore();
    });
  });
});