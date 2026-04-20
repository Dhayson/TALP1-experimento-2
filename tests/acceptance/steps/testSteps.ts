import { Given, When, Then } from '@cucumber/cucumber';

Given('the following students are in the class:', async function (data: any) {
  for (const row of data.rows()) {
    try {
      const studentResponse = await this.api.post('/api/students', {
        name: row[0],
        cpf: row[1],
        email: row[2]
      });
      this.createdStudents.push(studentResponse.data.id);

      if (this.createdClasses[0]) {
        await this.api.post(`/api/classes/${this.createdClasses[0]}/students/${studentResponse.data.id}`);
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.error?.includes('already registered')) {
        const existingStudent = (await this.api.get('/api/students')).data.find((s: any) => s.cpf === row[1]);
        if (existingStudent) {
          this.createdStudents.push(existingStudent.id);
          if (this.createdClasses[0]) {
            try {
              await this.api.post(`/api/classes/${this.createdClasses[0]}/students/${existingStudent.id}`);
            } catch {}
          }
        }
      }
    }
  }
});

Given('the following students exist:', async function (data: any) {
  for (const row of data.rows()) {
    const response = await this.api.post('/api/students', {
      name: row[0],
      cpf: row[1],
      email: row[2]
    });
    this.createdStudents.push(response.data.id);

    if (this.createdClasses[0]) {
      await this.api.post(`/api/classes/${this.createdClasses[0]}/students/${response.data.id}`);
    }
  }
});

Given('the class has no tests', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.get(`/api/classes/${classId}/tests`);
  if (response.data.length > 0) {
    for (const test of response.data) {
      await this.api.delete(`/api/classes/${classId}/tests/${test.id}`);
    }
  }
});

When('I view the class test results', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.get(`/api/classes/${classId}/results`);
  this.lastResponse = response;
});

Then('I should see a table with students in the first column', function () {
  const data = this.lastResponse?.data?.data || [];
  if (data.length === 0) {
    throw new Error('Expected students in table');
  }
});

Then('there should be no test columns', function () {
  const tests = this.lastResponse?.data?.tests || [];
  if (tests.length !== 0) {
    throw new Error('Expected no test columns');
  }
});

Then('all goals should be empty', function () {
  const data = this.lastResponse?.data?.data || [];
  for (const row of data) {
    for (const goal of Object.values(row.results || {})) {
      if (goal !== '') {
        throw new Error('Expected all goals to be empty');
      }
    }
  }
});

When('I add a test named {string} to the class', async function (testName: string) {
  const classId = this.createdClasses[0];
  const response = await this.api.post(`/api/classes/${classId}/tests`, { name: testName });
  this.lastResponse = response;
});

Then('the test should be created', function () {
  if (this.lastResponse?.status !== 201) {
    throw new Error('Expected 201 status');
  }
});

Then('I should see {string} as a column in the results table', function (testName: string) {
  const tests = this.lastResponse?.data?.tests || [];
  if (!tests.find((t: any) => t.name === testName)) {
    throw new Error(`Expected test column "${testName}"`);
  }
});

Given('a test {string} exists in the class', async function (testName: string) {
  const classId = this.createdClasses[0];
  const response = await this.api.post(`/api/classes/${classId}/tests`, { name: testName });
  this.lastResponse = response;
});

When('I set John Doe\'s result for {string} to {string}', async function (testName: string, goal: string) {
  const classId = this.createdClasses[0];
  const studentId = this.createdStudents[0];

  const testsResponse = await this.api.get(`/api/classes/${classId}/tests`);
  const test = testsResponse.data.find((t: any) => t.name === testName);

  if (!test) throw new Error(`Test "${testName}" not found`);

  const response = await this.api.post(`/api/classes/${classId}/results`, {
    studentId,
    testId: test.id,
    goal
  });
  this.lastResponse = response;
});

Then('the result should be saved', function () {
  if (this.lastResponse?.status !== 201) {
    throw new Error('Expected 201 status');
  }
});

Then('I should see {string} in the table', function (goal: string) {
  const data = this.lastResponse?.data || {};
  if (!data.goal || data.goal !== goal) {
    throw new Error(`Expected goal "${goal}" in table`);
  }
});

Given('John Doe has {string} for {string}', async function (goal: string, testName: string) {
  const classId = this.createdClasses[0];
  const studentId = this.createdStudents[0];

  const testsResponse = await this.api.get(`/api/classes/${classId}/tests`);
  let test = testsResponse.data.find((t: any) => t.name === testName);

  if (!test) {
    const testResponse = await this.api.post(`/api/classes/${classId}/tests`, { name: testName });
    await this.api.post(`/api/classes/${classId}/results`, {
      studentId,
      testId: testResponse.data.id,
      goal
    });
  } else {
    await this.api.post(`/api/classes/${classId}/results`, {
      studentId,
      testId: test.id,
      goal
    });
  }
});

Then('the result should be updated', function () {
  if (![200, 201].includes(this.lastResponse?.status)) {
    throw new Error('Expected 200 or 201 status');
  }
});

Given('the following tests exist in the class:', async function (data: any) {
  const classId = this.createdClasses[0];
  for (const row of data.rows()) {
    const response = await this.api.post(`/api/classes/${classId}/tests`, {
      name: row[0]
    });
  }
});

Given('the following results exist:', async function (data: any) {
  const classId = this.createdClasses[0];

  for (const row of data.rows()) {
    const studentName = row[0];
    const testName = row[1];
    const goal = row[2];

    const studentsResponse = await this.api.get(`/api/classes/${classId}`);
    const student = studentsResponse.data.students.find((s: any) => s.name === studentName);

    const testsResponse = await this.api.get(`/api/classes/${classId}/tests`);
    const test = testsResponse.data.find((t: any) => t.name === testName);

    if (student && test) {
      await this.api.post(`/api/classes/${classId}/results`, {
        studentId: student.id,
        testId: test.id,
        goal
      });
    }
  }
});

Then('I should see a table with {int} test columns', function (count: number) {
  const tests = this.lastResponse?.data?.tests || [];
  if (tests.length !== count) {
    throw new Error(`Expected ${count} test columns`);
  }
});

Then('the table should show all results', function () {
  const data = this.lastResponse?.data?.data || [];
  if (data.length === 0) {
    throw new Error('Expected results in table');
  }
});

When('I delete the test', async function () {
  const classId = this.createdClasses[0];
  const testsResponse = await this.api.get(`/api/classes/${classId}/tests`);
  if (testsResponse.data.length > 0) {
    const testId = testsResponse.data[0].id;
    const response = await this.api.delete(`/api/classes/${classId}/tests/${testId}`);
    this.lastResponse = response;
  }
});

Then('the test should be removed', function () {
  if (this.lastResponse?.status !== 204) {
    throw new Error('Expected 204 status');
  }
});

Then('the column should not appear in the results table', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.get(`/api/classes/${classId}/results`);
  const tests = response.data?.tests || [];
  if (tests.length > 0) {
    throw new Error('Expected no test columns');
  }
});

When('I remove the result', async function () {
  const classId = this.createdClasses[0];
  const studentId = this.createdStudents[0];

  const testsResponse = await this.api.get(`/api/classes/${classId}/tests`);
  if (testsResponse.data.length > 0) {
    const testId = testsResponse.data[0].id;
    const response = await this.api.delete(`/api/classes/${classId}/results?studentId=${studentId}&testId=${testId}`);
    this.lastResponse = response;
  }
});

Then('the result should be cleared', function () {
  if (![200, 204].includes(this.lastResponse?.status)) {
    throw new Error('Expected 200 or 204 status');
  }
});

Then('the goal should be empty', function () {
  const data = this.lastResponse?.data || {};
  if (data.goal !== '') {
    throw new Error('Expected empty goal');
  }
});

Given('tests {string} and {string} exist in the class', async function (testName1: string, testName2: string) {
  const classId = this.createdClasses[0];
  await this.api.post(`/api/classes/${classId}/tests`, { name: testName1 });
  await this.api.post(`/api/classes/${classId}/tests`, { name: testName2 });
});

Given('there are {int} students in the class', function (count: number) {
  const studentCount = this.createdStudents.length;
  if (studentCount !== count) {
    throw new Error(`Expected ${count} students`);
  }
});

When('I add a new student to the class', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.post('/api/students', {
    name: 'New Student',
    cpf: '999.999.999-99',
    email: 'new@test.com'
  });
  this.createdStudents.push(response.data.id);
  await this.api.post(`/api/classes/${classId}/students/${response.data.id}`);
  this.lastResponse = response;
});

Then('the new student should appear in the results table', function () {
  if (this.lastResponse?.status !== 201) {
    throw new Error('Expected 201 status');
  }
});

Then('the new student should have empty goals for all tests', async function () {
  const classId = this.createdClasses[0];
  const response = await this.api.get(`/api/classes/${classId}/results`);
  const data = response.data?.data || [];
  const newStudentRow = data.find((r: any) => r.student?.name === 'New Student');

  if (!newStudentRow) {
    throw new Error('New student not found in results');
  }

  for (const goal of Object.values(newStudentRow.results || {})) {
    if (goal !== '') {
      throw new Error('Expected empty goals');
    }
  }
});