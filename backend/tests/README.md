# Tests Directory

This directory contains tests for the backend application.

## Structure

```
tests/
├── unit/           # Unit tests for individual functions/classes
├── integration/    # Integration tests for API endpoints
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and fixtures
```

## Test Types

### Unit Tests
- Service layer tests
- Utility function tests
- Validation tests

### Integration Tests
- API endpoint tests
- Database integration tests
- Middleware tests

### E2E Tests
- Complete workflow tests
- User journey tests

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

Tests use Jest as the testing framework with the following configuration:
- ES modules support
- TypeORM test database
- Mock implementations for external services 