Feature: Student Management
  As a teacher
  I want to manage students
  So that I can keep track of all registered students

  Background:
    Given the system is running
    And there are no students registered

  Scenario: View empty student list
    When I view the student list
    Then I should see an empty list
    And I should see a message "No students registered"

  Scenario: Add a new student with valid data
    Given I have valid student data:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    When I add the student
    Then the student should be saved
    And I should see the student in the list

  Scenario: View student list with multiple students
    Given the following students exist:
      | name       | cpf           | email               |
      | John Doe   | 123.456.789-00 | john@example.com   |
      | Jane Smith | 987.654.321-00 | jane@example.com   |
    When I view the student list
    Then I should see 2 students

  Scenario: Edit an existing student
    Given a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    When I edit the student's name to "John Updated"
    Then the student should be updated
    And I should see "John Updated" in the list

  Scenario: Delete an existing student
    Given a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    When I delete the student
    Then the student should be removed
    And I should see an empty list

  Scenario: Add student with invalid CPF format
    Given I have student data with invalid CPF:
      | name    | cpf        | email              |
      | John Doe| 123456789  | john@example.com  |
    When I add the student
    Then I should see an error "Invalid CPF format"
    And the student should not be saved

  Scenario: Add student with invalid email format
    Given I have student data with invalid email:
      | name    | cpf          | email            |
      | John Doe| 123.456.789-00 | not-an-email   |
    When I add the student
    Then I should see an error "Invalid email format"
    And the student should not be saved

  Scenario: Add student with duplicate CPF
    Given a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    When I add another student with the same CPF:
      | name     | cpf          | email               |
      | Jane Doe | 123.456.789-00 | jane@example.com  |
    Then I should see an error "CPF already registered"
    And only one student should exist
