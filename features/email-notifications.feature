Feature: Email Notifications
  As a teacher
  I want students to receive daily email notifications
  So that they stay informed about their test results

  Background:
    Given the system is running
    And there are no pending email notifications
    And there are no classes defined
    And there are no students registered

  Scenario: Track change when test result is added
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    And the student is in the class
    And a test "Test 1" exists in the class
    When I set the student's result for "Test 1" to "MA"
    Then a change should be tracked for the student
    And the change should include the test name and goal

  Scenario: Track change when test result is edited
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    And the student is in the class
    And a test "Test 1" exists in the class
    And the student has "MANA" for "Test 1"
    When I edit the result to "MA"
    Then a change should be tracked for the student
    And the change should reflect the updated goal

  Scenario: Send daily email with aggregated changes for one student
    Given a class exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    And the student is in the class
    And a test "Test 1" exists in the class
    And a test "Test 2" exists in the class
    And the following changes were made today:
      | test  | oldGoal | newGoal |
      | Test 1|         | MA      |
      | Test 2|         | MPA     |
    When the daily email is sent at noon
    Then one email should be sent to john@example.com
    And the email should contain both "Test 1: MA" and "Test 2: MPA"

  Scenario: Aggregate changes from multiple classes for one student
    Given class "Math 101" exists:
      | topic    | year | semester |
      | Math 101 | 2026 | 1        |
    And class "Physics" exists:
      | topic   | year | semester |
      | Physics | 2026 | 1        |
    And a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    And the student is in both classes
    And a test "Test 1" exists in "Math 101"
    And a test "Test 1" exists in "Physics"
    And the student got "MA" in "Math 101" "Test 1" today
    And the student got "MPA" in "Physics" "Test 1" today
    When the daily email is sent at noon
    Then one email should be sent to john@example.com
    And the email should include changes from both classes

  Scenario: No duplicate email on same day
    Given a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    And an email was already sent to the student today
    When a new change is made for the student
    Then no additional email should be sent until tomorrow

  Scenario: Reset email tracking for new day
    Given a student exists:
      | name    | cpf          | email              |
      | John Doe| 123.456.789-00 | john@example.com  |
    And an email was sent yesterday
    When a change is made for the student
    Then a new email should be sent the next day