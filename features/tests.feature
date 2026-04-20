Feature: Test and Goal Management
  As a teacher
  I want to manage student tests and goals
  So that I can track student performance

  Background:
    Given the system is running
    And there are no classes defined
    And there are no students registered
    And a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And the following students are in the class:
      | name       | cpf           | email               |
      | John Doe   | 123.456.789-00 | john@example.com   |
      | Jane Smith | 987.654.321-00 | jane@example.com   |

  Scenario: View empty test results table for a class
    When I view the class test results
    Then I should see a table with students in the first column
    And there should be no test columns
    And all goals should be empty

  Scenario: Add a custom test to a class
    Given the class has no tests
    When I add a test named "Test 1" to the class
    Then the test should be created
    And I should see "Test 1" as a column in the results table

  Scenario: Add test result with MANA goal
    Given a test "Test 1" exists in the class
    When I set John Doe's result for "Test 1" to "MANA"
    Then the result should be saved
    And I should see "MANA" in the table

  Scenario: Add test result with MPA goal
    Given a test "Test 1" exists in the class
    When I set John Doe's result for "Test 1" to "MPA"
    Then the result should be saved
    And I should see "MPA" in the table

  Scenario: Add test result with MA goal
    Given a test "Test 1" exists in the class
    When I set John Doe's result for "Test 1" to "MA"
    Then the result should be saved
    And I should see "MA" in the table

  Scenario: Edit an existing test result
    Given John Doe has "MANA" for "Test 1"
    When I edit the result to "MA"
    Then the result should be updated
    And I should see "MA" in the table

  Scenario: View multiple students with multiple tests
    Given the following tests exist in the class:
      | testName  |
      | Test 1   |
      | Test 2   |
    And the following results exist:
      | student   | test  | goal |
      | John Doe  | Test 1| MA   |
      | John Doe  | Test 2| MPA  |
      | Jane Smith| Test 1| MANA |
    When I view the class test results
    Then I should see a table with 2 test columns
    And the table should show all results

  Scenario: Delete a test from a class
    Given a test "Test 1" exists in the class
    When I delete the test
    Then the test should be removed
    And the column should not appear in the results table

  Scenario: Remove test result for a student
    Given John Doe has "MA" for "Test 1"
    When I remove the result
    Then the result should be cleared
    And the goal should be empty

  Scenario: Add student to class after tests exist
    Given tests "Test 1" and "Test 2" exist in the class
    And there are 2 students in the class
    When I add a new student to the class
    Then the new student should appear in the results table
    And the new student should have empty goals for all tests