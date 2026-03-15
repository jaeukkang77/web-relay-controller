import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.test.json',
        diagnostics: false, // ts-jest 타입 에러를 Jest 에러로 올리지 않음
      },
    ],
  },
  // workspace 패키지 path alias 해소
  moduleNameMapper: {
    '^@repo/prisma-db(.*)$': '<rootDir>/../../packages/prisma-db/src$1',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    'main.ts',
    '\\.module\\.ts$',
    'node_modules',
  ],
  testEnvironment: 'node',
};

export default config;
