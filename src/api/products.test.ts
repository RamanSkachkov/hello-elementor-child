/**
 * Unit tests for the products API layer.
 *
 * Verifies that each API function calls @wordpress/api-fetch
 * with the correct path, method, and data.
 */

import '@testing-library/jest-dom';
import apiFetch from '@wordpress/api-fetch';

import {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	getCategories,
} from './products';

import type { Product, ProductPayload, Category, DeleteResult } from '../types';

jest.mock( '@wordpress/api-fetch' );

const mockedFetch = apiFetch as jest.MockedFunction< typeof apiFetch >;

/* ----------------------------------------------------------------
 * Fixtures
 * -------------------------------------------------------------- */

const mockProduct: Product = {
	id: 1,
	title: 'Test Widget',
	description: 'A test product.',
	price: 29.99,
	sale_price: 19.99,
	is_on_sale: true,
	youtube_video: 'https://youtube.com/watch?v=abc',
	featured_image_id: 10,
	featured_image_url: 'http://localhost/wp-content/uploads/test.jpg',
	categories: [ 1, 2 ],
	date: '2026-01-01T00:00:00',
	status: 'publish',
};

const mockPayload: ProductPayload = {
	title: 'New Product',
	description: 'Description here.',
	price: 49.99,
	sale_price: 39.99,
	is_on_sale: false,
	youtube_video: '',
	featured_image_id: 0,
	categories: [],
};

/* ----------------------------------------------------------------
 * Tests
 * -------------------------------------------------------------- */

describe( 'API – products', () => {
	beforeEach( () => {
		mockedFetch.mockReset();
	} );

	/* ---------- getProducts ---------- */

	it( 'fetches all products with default per_page', async () => {
		mockedFetch.mockResolvedValueOnce( [ mockProduct ] );

		const result = await getProducts();

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/products?per_page=100',
		} );
		expect( result ).toEqual( [ mockProduct ] );
	} );

	it( 'respects custom per_page parameter', async () => {
		mockedFetch.mockResolvedValueOnce( [] );

		await getProducts( 10 );

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/products?per_page=10',
		} );
	} );

	/* ---------- getProduct ---------- */

	it( 'fetches a single product by ID', async () => {
		mockedFetch.mockResolvedValueOnce( mockProduct );

		const result = await getProduct( 1 );

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/products/1',
		} );
		expect( result ).toEqual( mockProduct );
	} );

	/* ---------- createProduct ---------- */

	it( 'creates a product with POST method', async () => {
		mockedFetch.mockResolvedValueOnce( { ...mockProduct, ...mockPayload } );

		const result = await createProduct( mockPayload );

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/products',
			method: 'POST',
			data: mockPayload,
		} );
		expect( result.title ).toBe( 'New Product' );
	} );

	/* ---------- updateProduct ---------- */

	it( 'updates a product with POST method and ID in path', async () => {
		const partial = { title: 'Updated Title' };
		mockedFetch.mockResolvedValueOnce( {
			...mockProduct,
			title: 'Updated Title',
		} );

		const result = await updateProduct( 1, partial );

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/products/1',
			method: 'POST',
			data: partial,
		} );
		expect( result.title ).toBe( 'Updated Title' );
	} );

	/* ---------- deleteProduct ---------- */

	it( 'deletes a product with DELETE method', async () => {
		const deleteResult: DeleteResult = { deleted: true, id: 1 };
		mockedFetch.mockResolvedValueOnce( deleteResult );

		const result = await deleteProduct( 1 );

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/products/1',
			method: 'DELETE',
		} );
		expect( result.deleted ).toBe( true );
	} );

	/* ---------- getCategories ---------- */

	it( 'fetches all product categories', async () => {
		const mockCategories: Category[] = [
			{ id: 1, name: 'Electronics', slug: 'electronics', count: 5 },
			{ id: 2, name: 'Clothing', slug: 'clothing', count: 3 },
		];
		mockedFetch.mockResolvedValueOnce( mockCategories );

		const result = await getCategories();

		expect( mockedFetch ).toHaveBeenCalledWith( {
			path: '/jeec/v1/product-categories',
		} );
		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ].name ).toBe( 'Electronics' );
	} );

	/* ---------- Error handling ---------- */

	it( 'propagates network errors from apiFetch', async () => {
		mockedFetch.mockRejectedValueOnce( new Error( 'Network Error' ) );

		await expect( getProducts() ).rejects.toThrow( 'Network Error' );
	} );
} );
