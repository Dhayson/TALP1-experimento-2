I would like to create a react app with a node backend for managing students of a classroom. The system should be able to include, alter and remove students.

1. There should be a page with the list of registered students. Each student needs to have their name, id (Brazillian CPF) and email.
2. In another page, it should be the management of students tests, with a table with the names of the students in the first column and, for each student, their tests and respective goals. The tests' goals are indicated by the concepts MANA, MPA and MA, meaning failure, partial success and success.
3. There should be persistence in the students registry and their tests and goals, using JSON.
4. Management of classes, with inclusion, alteration and deletion. Each class has its topic, year, semester, the list of students in this class and information about the tests of the students in the class. It should be possible to visualize each class with their students and tests separately.
5. Send an email for a student when the teacher adds or alter their test result for some goal. At most, one email should be sent in each day, with every alteration in all classes that this is student is in.

Please do not allucinate or complicate. Think before generating the code. Code legibility is key here; usability is also important, so a nice and modern user interface is good. Please use Typescript in both the client and the server code. For now, I need no access control/ or login functionality.

Furthermore, use Cucumber with the Gherkin language for scenarios, and use this for acceptance testing.

Focus on a simple, minimalistic implementation, with no-nonsense, no overengineering and no animations.