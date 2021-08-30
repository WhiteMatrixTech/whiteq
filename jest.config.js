module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: './test/.+\\.spec\\.ts$',
  testPathIgnorePatterns: [
    //
    '/node_modules/',
    '/dist/'
  ],
  transformIgnorePatterns: [
    //
    '/node_modules/',
    '/dist/'
  ],
  coveragePathIgnorePatterns: [
    //
    '/node_modules/',
    '/dist/'
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  // preset: '@shelf/jest-mongodb',
  globalSetup: './test/setup.ts',
  testTimeout: 90000,
  collectCoverageFrom: [
    //
    'src/**/*.{js,ts}'
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: null
};
