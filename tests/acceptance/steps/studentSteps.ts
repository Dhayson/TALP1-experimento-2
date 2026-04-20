import { Given, When, Then } from '@cucumber/cucumber';

Given('the system is running', async function () {
  const response = await this.api.get('/health');
  if (response.status !== 200) throw new Error('Server not running');
});

Given('there are no students registered', async function () {
  const response = await this.api.get('/api/students');
  if (response.status !== 200) throw new Error('Failed to get students');
});

Given('a student exists:', async function (data: any) {
  const student = data.rows()[0];
  const response = await this.api.post('/api/students', {
    name: student[0],
    cpf: student[1],
    email: student[2]
  });
  this.createdStudents.push(response.data.id);
  if (response.status !== 201) throw new Error('Failed to create student');
});

Given('the following students exist:', async function (data: any) {
  for (const row of data.rows()) {
    const response = await this.api.post('/api/students', {
      name: row[0],
      cpf: row[1],
      email: row[2]
    });
    this.createdStudents.push(response.data.id);
  }
});

Given('I have valid student data:', async function (data: any) {
  const student = data.rows()[0];
  this.pendingData = {
    name: student[0],
    cpf: student[1],
    email: student[2]
  };
});

Given('I have student data with invalid CPF:', async function (data: any) {
  const student = data.rows()[0];
  this.pendingData = {
    name: student[0],
    cpf: student[1],
    email: student[2]
  };
});

Given('I have student data with invalid email:', async function (data: any) {
  const student = data.rows()[0];
  this.pendingData = {
    name: student[0],
    cpf: student[1],
    email: student[2]
  };
});

When('I view the student list', async function () {
  const response = await this.api.get('/api/students');
  this.lastResponse = response;
});

When('I add the student', async function () {
  try {
    const response = await this.api.post('/api/students', this.pendingData);
    if (response.status === 201) {
      this.createdStudents.push(response.data.id);
    }
    this.lastResponse = response;
  } catch (err: any) {
    this.lastResponse = err.response;
    this.errorMessage = err.response?.data?.error || '';
  }
});

When('I edit the student\'s name to {string}', async function (name: string) {
  const studentId = this.createdStudents[0];
  const response = await this.api.put(`/api/students/${studentId}`, { name });
  this.lastResponse = response;
});

When('I delete the student', async function () {
  const studentId = this.createdStudents[0];
  const response = await this.api.delete(`/api/students/${studentId}`);
  this.createdStudents.shift();
  this.lastResponse = response;
});

Then('I should see an empty list', function () {
  if (!Array.isArray(this.lastResponse?.data) || this.lastResponse.data.length > 0) {
    throw new Error('Expected empty list');
  }
});

Then('I should see a message {string}', function (message: string) {
  const msg = this.lastResponse?.data?.message || this.errorMessage || '';
  if (!msg.includes(message)) {
    throw new Error(`Expected message containing "${message}", got "${msg}"`);
  }
});

Then('the student should be saved', function () {
  if (this.lastResponse?.status !== 201) {
    throw new Error('Expected 201 status');
  }
});

Then('I should see the student in the list', function () {
  if (this.lastResponse?.status !== 201) {
    throw new Error('Expected 201 status');
  }
});

Then('I should see {int} students', function (count: number) {
  if (this.lastResponse?.data?.length !== count) {
    throw new Error(`Expected ${count} students`);
  }
});

Then('the student should be updated', function () {
  if (this.lastResponse?.status !== 200) {
    throw new Error('Expected 200 status');
  }
});

Then('I should see {string} in the list', function (name: string) {
  if (this.lastResponse?.data?.name !== name) {
    throw new Error(`Expected name "${name}"`);
  }
});

Then('the student should be removed', function () {
  if (this.lastResponse?.status !== 204) {
    throw new Error('Expected 204 status');
  }
});

Then('I should see an error {string}', function (error: string) {
  const errMsg = this.errorMessage || this.lastResponse?.data?.error || '';
  if (!errMsg.includes(error)) {
    throw new Error(`Expected error containing "${error}", got "${errMsg}"`);
  }
});

Then('the student should not be saved', function () {
  if (this.lastResponse?.status !== 400) {
    throw new Error('Expected 400 status');
  }
});

Then('only one student should exist', async function () {
  const response = await this.api.get('/api/students');
  if (response.data.length !== 1) {
    throw new Error('Expected only 1 student');
  }
});

Then('I should see "John Updated" in the list', function () {
  if (this.lastResponse?.data?.name !== 'John Updated') {
    throw new Error('Expected name "John Updated"');
  }
});