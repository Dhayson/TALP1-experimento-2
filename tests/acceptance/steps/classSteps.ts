import { Given, When, Then } from '@cucumber/cucumber';

Given('there are no classes defined', async function () {
  const response = await this.api.get('/api/classes');
  if (response.status !== 200) throw new Error('Failed to get classes');
});

Given('I have valid class data:', async function (data: any) {
  const classData = data.rows()[0];
  this.pendingClassData = {
    topic: classData[0],
    year: parseInt(classData[1]),
    semester: parseInt(classData[2])
  };
});

Given('the following classes exist:', async function (data: any) {
  for (const row of data.rows()) {
    const response = await this.api.post('/api/classes', {
      topic: row[0],
      year: parseInt(row[1]),
      semester: parseInt(row[2])
    });
    this.createdClasses.push(response.data.id);
  }
});

Given('a class exists:', async function (data: any) {
  const classData = data.rows()[0];
  const response = await this.api.post('/api/classes', {
    topic: classData[0],
    year: parseInt(classData[1]),
    semester: parseInt(classData[2])
  });
  this.createdClasses.push(response.data.id);
});

When('I view the class list', async function () {
  const response = await this.api.get('/api/classes');
  this.lastResponse = response;
});

When('I add the class', async function () {
  try {
    const response = await this.api.post('/api/classes', this.pendingClassData);
    if (response.status === 201) {
      this.createdClasses.push(response.data.id);
    }
    this.lastResponse = response;
  } catch (err: any) {
    this.lastResponse = err.response;
    this.errorMessage = err.response?.data?.error || '';
  }
});

Then('the class should be saved', function () {
  if (this.lastResponse?.status !== 201) {
    throw new Error('Expected 201 status');
  }
});

Then('I should see {int} classes', function (count: number) {
  if (this.lastResponse?.data?.length !== count) {
    throw new Error(`Expected ${count} classes`);
  }
});

When('I edit the class topic to {string}', async function (topic: string) {
  const classId = this.createdClasses[0];
  const response = await this.api.put(`/api/classes/${classId}`, { topic });
  this.lastResponse = response;
});

Then('the class should be updated', function () {
  if (this.lastResponse?.status !== 200) {
    throw new Error('Expected 200 status');
  }
});

When('I delete the class', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.delete(`/api/classes/${classId}`);
  this.createdClasses.shift();
  this.lastResponse = response;
});

Then('the class should be removed', function () {
  if (this.lastResponse?.status !== 204) {
    throw new Error('Expected 204 status');
  }
});

When('I add the student to the class', async function () {
  const classId = this.createdClasses[0];
  const studentId = this.createdStudents[0];
  const response = await this.api.post(`/api/classes/${classId}/students/${studentId}`);
  this.lastResponse = response;
});

Then('the student should be associated with the class', function () {
  if (this.lastResponse?.status !== 200) {
    throw new Error('Expected 200 status');
  }
});

When('I view the class details', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.get(`/api/classes/${classId}`);
  this.lastResponse = response;
});

Then('I should see {int} students in the class', function (count: number) {
  const students = this.lastResponse?.data?.students || [];
  if (students.length !== count) {
    throw new Error(`Expected ${count} students`);
  }
});

When('I remove the student from the class', async function () {
  const classId = this.createdClasses[0];
  const studentId = this.createdStudents[0];
  const response = await this.api.delete(`/api/classes/${classId}/students/${studentId}`);
  this.lastResponse = response;
});

Then('the student should no longer be in the class', function () {
  if (this.lastResponse?.status !== 200) {
    throw new Error('Expected 200 status');
  }
});