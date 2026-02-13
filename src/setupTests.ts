/**
 * Jest setup file — runs before each test suite.
 *
 * Mocks global WordPress objects (window.jeecData, wp.media).
 * NOTE: @testing-library/jest-dom is imported in each test file
 * because setupFiles runs before the test framework, so `expect`
 * is not yet available here.
 */

/* ----------------------------------------------------------------
 * Mock window.jeecData (injected by wp_localize_script)
 * -------------------------------------------------------------- */
Object.defineProperty( window, 'jeecData', {
	value: {
		restUrl: 'http://localhost/wp-json/jeec/v1/',
		restNonce: 'test-nonce-123',
		adminUrl: 'http://localhost/wp-admin/',
	},
	writable: true,
} );

/* ----------------------------------------------------------------
 * Mock wp.media (WordPress media frame)
 * -------------------------------------------------------------- */
const mockMediaFrame = {
	on: jest.fn(),
	open: jest.fn(),
	state: jest.fn( () => ( {
		get: jest.fn( () => ( {
			first: jest.fn( () => ( {
				toJSON: jest.fn( () => ( {
					id: 42,
					url: 'http://localhost/wp-content/uploads/test.jpg',
					sizes: {
						thumbnail: { url: 'http://localhost/wp-content/uploads/test-150x150.jpg' },
					},
				} ) ),
			} ) ),
		} ) ),
	} ) ),
};

( globalThis as Record<string, unknown> ).wp = {
	media: jest.fn( () => mockMediaFrame ),
};
