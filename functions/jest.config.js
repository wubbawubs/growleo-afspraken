/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest']
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/test/**/*.test.ts']
}; 