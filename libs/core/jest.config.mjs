export default {
  displayName: '@project/core',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  rootDir: '.',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@project/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.(test|spec).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
  ],
};
