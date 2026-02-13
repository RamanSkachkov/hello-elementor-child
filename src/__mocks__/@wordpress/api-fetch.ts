/**
 * Mock for @wordpress/api-fetch.
 *
 * Each test can override the resolved value via:
 *   ( apiFetch as jest.Mock ).mockResolvedValueOnce( data );
 */
const apiFetch = jest.fn();
export default apiFetch;
