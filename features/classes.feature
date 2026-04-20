Feature: Class Management
  As a teacher
  I want to manage classes
  So that I can organize students by class and topic

  Background:
    Given the system is running
    And there are no classes defined
    And there are no students registered

  Scenario: View empty class list
    When I view the class list
    Then I should see an empty list
    And I should see a message "No classes defined"

  Scenario: Add a new class with valid data
    Given I have valid class data:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    When I add the class
    Then the class should be saved
    And I should see the class in the list

  Scenario: View class list with multiple classes
    Given the following classes exist:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
      | Physics  | 2026 | 1        |
    When I view the class list
    Then I should see 2 classes

  Scenario: Edit an existing class
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    When I edit the class topic to "Advanced Math"
    Then the class should be updated
    And I should see "Advanced Math" in the list

  Scenario: Delete an existing class
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    When I delete the class
    Then the class should be removed
    And I should see an empty list

  Scenario: Add a student to a class
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    When I add the student to the class
    Then the student should be associated with the class

  Scenario: View class details with students
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And the following students are in the class:
      | name       | cpf           | email               |
      | John Doe   | 123.456.789-00 | john@example.com   |
      | Jane Smith | 987.654.321-00 | jane@example.com   |
    When I view the class details
    Then I should see 2 students in the class

  Scenario: Remove a student from a class
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And a student is in the class:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    When I remove the student from the class
    Then the student should no longer be in the class