/**
 * Core domain types for the Products Manager application.
 */

/** Product as returned by the REST API. */
export interface Product {
	readonly id: number;
	title: string;
	description: string;
	price: number;
	sale_price: number;
	is_on_sale: boolean;
	youtube_video: string;
	featured_image_id: number;
	featured_image_url: string;
	categories: number[];
	readonly date: string;
	readonly status: string;
}

/** Payload sent when creating or updating a product. */
export interface ProductPayload {
	title: string;
	description: string;
	price: number;
	sale_price: number;
	is_on_sale: boolean;
	youtube_video: string;
	featured_image_id: number;
	categories: number[];
}

/** Product category (taxonomy term). */
export interface Category {
	readonly id: number;
	name: string;
	slug: string;
	count: number;
}

/** Application-level notice shown to the user. */
export interface AppNotice {
	status: 'success' | 'error' | 'warning' | 'info';
	message: string;
}

/** Possible screens in the app. */
export type Screen = 'list' | 'add' | 'edit';

/** Delete confirmation result from the API. */
export interface DeleteResult {
	deleted: boolean;
	id: number;
}
