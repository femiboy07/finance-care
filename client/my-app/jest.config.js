module.exports = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node_modules/(?!axios)','/assets/.*\\.(jpg|jpeg|png|gif|svg)$',],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '/_mocks_/filemock.ts',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
};