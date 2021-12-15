import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@components/(.*)': '<rootDir>/src/components/$1',
    '@libs/(.*)': '<rootDir>/src/libs/$1',
    '@types/': '<rootDir>/src/types'
  }
};
export default config;
