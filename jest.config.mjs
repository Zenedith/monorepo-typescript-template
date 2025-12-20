export default {
  projects: [
    'libs/*/jest.config.mjs',
    'packages/*/jest.config.mjs',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};

