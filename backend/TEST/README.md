# TEST Directory

This directory contains test scripts for the LLMediCare backend system.

## Available Tests

1. **test_chatbot.py** - Tests the chatbot with multiple queries to verify response variety.
2. **test_fix.py** - Tests that the chatbot doesn't duplicate sections in responses.
3. **test_api.py** - Tests the API endpoint for duplicate section issues.
4. **test_single.py** - Simple test with a single flu-related query.

## Running the Tests

### Prerequisites

- Make sure the Django server is running (for API tests)
- Ensure Ollama service is running with the Gemma model available

### How to Run Tests

From the `backend` directory:

```bash
# Run a single test
python -m TEST.test_fix

# Run API test (requires server to be running)
python -m TEST.test_api
```

Or from the TEST directory:

```bash
# Run a single test
python test_fix.py

# Run API test (requires server to be running)
python test_api.py
```

### Expected Output

All tests should display a "TEST PASSED" message if successful. The tests check for:

1. Proper formatting of responses
2. No duplicate sections in responses
3. Appropriate content based on the query

## Notes

These tests are designed to verify that the chatbot:

- Provides different responses based on different queries
- Properly formats responses with standard sections
- Doesn't duplicate response sections
