const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/integration/rls-policies.test.{js,jsx,ts,tsx}',
  ],
  testTimeout: 60000, // Extra long timeout for security tests
  maxWorkers: 1, // Run security tests serially
  verbose: true, // Detailed output for security test results
  bail: true, // Stop on first failure for security tests
}

module.exports = createJestConfig(customJestConfig)