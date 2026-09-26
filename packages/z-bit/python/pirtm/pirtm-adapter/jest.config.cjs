/** @type {import('jest').Config} */
module.exports = {
  displayName: 'pirtm-adapter',
  preset: 'ts-jest',
  testEnvironment: 'node',

  rootDir: '.',

  testMatch: [
    '<rootDir>/src/**/*.test.ts'
  ],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },

  transformIgnorePatterns: [
    'node_modules/'
  ]
};
