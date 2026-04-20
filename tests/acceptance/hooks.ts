import { Before, After, setWorldConstructor } from '@cucumber/cucumber';
import axios from 'axios';
import { spawn } from 'child_process';

const API_URL = 'http://localhost:3001';

let serverProcess: any = null;

class CustomWorld {
  api: any;
  lastResponse: any;
  createdStudents: string[] = [];
  createdClasses: string[] = [];
  createdTests: string[] = [];
  errorMessage: string = '';
  pendingData: any;
  pendingClassData: any;

  constructor({ log, attach }: any) {
    this.api = axios.create({ baseURL: API_URL });
  }
}

setWorldConstructor(CustomWorld);

async function checkServer(): Promise<boolean> {
  try {
    await axios.get(`${API_URL}/health`);
    return true;
  } catch {
    return false;
  }
}

async function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('npm', ['run', 'start'], {
      detached: true,
      stdio: 'ignore'
    });
    
    let attempts = 0;
    const check = setInterval(async () => {
      attempts++;
      try {
        await axios.get(`${API_URL}/health`);
        clearInterval(check);
        resolve();
      } catch {
        if (attempts > 10) {
          clearInterval(check);
          reject(new Error('Server failed to start'));
        }
      }
    }, 1000);
  });
}

Before(async function () {
  this.lastResponse = null;
  this.createdStudents = [];
  this.createdClasses = [];
  this.createdTests = [];
  this.errorMessage = '';
  this.pendingData = null;
  this.pendingClassData = null;

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('Starting server...');
    await startServer();
    console.log('Server started');
  }

  await this.api.post('/test/cleanup');
});

After(async function () {
  for (const testId of this.createdTests) {
    try {
      await this.api.delete(`/api/classes/class-1/tests/${testId}`);
    } catch {}
  }
  for (const studentId of this.createdStudents) {
    try {
      await this.api.delete(`/api/students/${studentId}`);
    } catch {}
  }
  for (const classId of this.createdClasses) {
    try {
      await this.api.delete(`/api/classes/${classId}`);
    } catch {}
  }
});