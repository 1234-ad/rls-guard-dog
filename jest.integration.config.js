const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node', // Use node environment for database tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  testTimeout: 30000, // Longer timeout for database operations
  collectCoverageFrom: [
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
}

module.exports = createJestConfig(customJestConfig)