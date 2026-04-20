import { Before, After, setWorldConstructor } from '@cucumber/cucumber';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

class CustomWorld {
  api: any;
  lastResponse: any;
  createdStudents: string[] = [];
  createdClasses: string[] = [];
  createdTests: string[] = [];
  errorMessage: string = '';
  pendingData: any;

  constructor({ log, attach }: any) {
    this.api = axios.create({ baseURL: API_URL });
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  this.lastResponse = null;
  this.createdStudents = [];
  this.createdClasses = [];
  this.createdTests = [];
  this.errorMessage = '';
  this.pendingData = null;
});

After(async function () {
  for (const testId of this.createdTests) {
    try {
      await this.api.delete(`/classes/class-1/tests/${testId}`);
    } catch {}
  }
  for (const studentId of this.createdStudents) {
    try {
      await this.api.delete(`/students/${studentId}`);
    } catch {}
  }
  for (const classId of this.createdClasses) {
    try {
      await this.api.delete(`/classes/${classId}`);
    } catch {}
  }
});