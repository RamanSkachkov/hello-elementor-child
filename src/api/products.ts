/**
 * Typed REST API layer for Products.
 *
 * All functions communicate with the custom `jeec/v1` endpoints
 * registered in inc/rest-api.php.
 */

import apiFetch from '@wordpress/api-fetch';

import type { Product, ProductPayload, Category, DeleteResult } from '../types';

const API_NAMESPACE = '/jeec/v1';

/* ------------------------------------------------------------------
 * Products
 * ---------------------------------------------------------------- */

/** Fetch all published products. */
export async function getProducts(perPage = 100): Promise<Product[]> {
	return apiFetch<Product[]>({
		path: `${ API_NAMESPACE }/products?per_page=${ perPage }`,
	});
}

/** Fetch a single product by ID. */
export async function getProduct(id: number): Promise<Product> {
	return apiFetch<Product>({
		path: `${ API_NAMESPACE }/products/${ id }`,
	});
}

/** Create a new product. */
export async function createProduct(data: ProductPayload): Promise<Product> {
	return apiFetch<Product>({
		path: `${ API_NAMESPACE }/products`,
		method: 'POST',
		data,
	});
}

/** Update an existing product (partial update supported). */
export async function updateProduct(
	id: number,
	data: Partial<ProductPayload>,
): Promise<Product> {
	return apiFetch<Product>({
		path: `${ API_NAMESPACE }/products/${ id }`,
		method: 'POST',
		data,
	});
}

/** Permanently delete a product. */
export async function deleteProduct(id: number): Promise<DeleteResult> {
	return apiFetch<DeleteResult>({
		path: `${ API_NAMESPACE }/products/${ id }`,
		method: 'DELETE',
	});
}

/* ------------------------------------------------------------------
 * Categories
 * ---------------------------------------------------------------- */

/** Fetch all product categories (including empty ones). */
export async function getCategories(): Promise<Category[]> {
	return apiFetch<Category[]>({
		path: `${ API_NAMESPACE }/product-categories`,
	});
}
