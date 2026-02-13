/**
 * Jest configuration for the Products Manager React app.
 *
 * Uses @wordpress/scripts built-in preset as a base,
 * then adds TypeScript + testing-library setup.
 */

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: '@wordpress/jest-preset-default',

	roots: [ '<rootDir>/src' ],

	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
		'<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
	],

	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},

	moduleNameMapper: {
		'\\.(css|scss)$': '<rootDir>/src/__mocks__/styleMock.ts',
		'^@/(.*)$': '<rootDir>/src/$1',
	},

	// Global mocks (window.jeecData, wp.media) — these only use jest.fn()
	// which is available before the test framework.
	setupFiles: [ '<rootDir>/src/setupTests.ts' ],

	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/index.tsx',
		'!src/__mocks__/**',
		'!src/setupTests.ts',
	],

	testEnvironment: 'jsdom',
};

export default config;
