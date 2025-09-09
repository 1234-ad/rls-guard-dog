import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-rls-guard-dog'
process.env.MONGODB_DB_NAME = 'test-rls-guard-dog'

// Global test setup
beforeAll(() => {
  // Setup code that runs before all tests
})

afterAll(() => {
  // Cleanup code that runs after all tests
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}