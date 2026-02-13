/**
 * Unit tests for the ProductForm component.
 *
 * Tests both "Add New" and "Edit" modes, form validation,
 * and submit behaviour.
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProductForm from './ProductForm';
import * as api from '../api/products';
import type { Product } from '../types';

jest.mock( '../api/products' );
jest.mock( '../hooks/useCategories', () => ( {
	useCategories: () => [
		{ id: 1, name: 'Electronics', slug: 'electronics', count: 5 },
	],
} ) );

/* Lightweight mocks for ImagePicker and CategorySelector
 * so we avoid @wordpress/components deprecation warnings. */
jest.mock( './ImagePicker', () => {
	return function MockImagePicker() {
		return <div data-testid="image-picker">ImagePicker</div>;
	};
} );
jest.mock( './CategorySelector', () => {
	return function MockCategorySelector() {
		return <div data-testid="category-selector">CategorySelector</div>;
	};
} );

const mockedApi = api as jest.Mocked< typeof api >;

/* ----------------------------------------------------------------
 * Fixtures
 * -------------------------------------------------------------- */

const existingProduct: Product = {
	id: 42,
	title: 'Existing Widget',
	description: 'Original description.',
	price: 25,
	sale_price: 15,
	is_on_sale: true,
	youtube_video: 'https://youtube.com/watch?v=old',
	featured_image_id: 10,
	featured_image_url: 'http://localhost/img.jpg',
	categories: [ 1 ],
	date: '2026-01-01',
	status: 'publish',
};

/* ----------------------------------------------------------------
 * Tests
 * -------------------------------------------------------------- */

describe( 'ProductForm', () => {
	const defaultProps = {
		onCancel: jest.fn(),
		onSaved: jest.fn(),
		setNotice: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	/* ---------- Add mode ---------- */

	describe( 'Add New Product mode', () => {
		it( 'renders "Add New Product" heading', () => {
			render( <ProductForm { ...defaultProps } /> );

			// WP Gutenberg components emit deprecation warnings
			// (TextControl __next40pxDefaultSize, TextareaControl __nextHasNoMarginBottom).
			// Acknowledge them so @wordpress/jest-console doesn't fail the test.
			expect( console ).toHaveWarned();

			expect(
				screen.getByRole( 'heading', { name: /add new product/i } ),
			).toBeInTheDocument();
		} );

		it( 'renders "Create Product" submit button', () => {
			render( <ProductForm { ...defaultProps } /> );

			expect(
				screen.getByRole( 'button', { name: /create product/i } ),
			).toBeInTheDocument();
		} );

		it( 'renders core form fields (Title, Description, YouTube)', () => {
			render( <ProductForm { ...defaultProps } /> );

			expect( screen.getByLabelText( /^title$/i ) ).toBeInTheDocument();
			expect(
				screen.getByLabelText( /description/i ),
			).toBeInTheDocument();
			expect(
				screen.getByLabelText( /youtube video/i ),
			).toBeInTheDocument();
		} );

		it( 'renders "Is on Sale?" toggle', () => {
			render( <ProductForm { ...defaultProps } /> );

			expect(
				screen.getByLabelText( /is on sale/i ),
			).toBeInTheDocument();
		} );

		it( 'renders ImagePicker and CategorySelector', () => {
			render( <ProductForm { ...defaultProps } /> );

			expect( screen.getByTestId( 'image-picker' ) ).toBeInTheDocument();
			expect(
				screen.getByTestId( 'category-selector' ),
			).toBeInTheDocument();
		} );

		it( 'shows error notice when title is empty on submit', async () => {
			const user = userEvent.setup();
			render( <ProductForm { ...defaultProps } /> );

			await user.click(
				screen.getByRole( 'button', { name: /create product/i } ),
			);

			expect( defaultProps.setNotice ).toHaveBeenCalledWith(
				expect.objectContaining( {
					status: 'error',
					message: expect.stringContaining( 'Title is required' ),
				} ),
			);
		} );

		it( 'calls createProduct on valid submit', async () => {
			mockedApi.createProduct.mockResolvedValueOnce( {
				...existingProduct,
				id: 99,
				title: 'New Widget',
			} );
			const user = userEvent.setup();

			render( <ProductForm { ...defaultProps } /> );

			await user.type( screen.getByLabelText( /^title$/i ), 'New Widget' );
			await user.click(
				screen.getByRole( 'button', { name: /create product/i } ),
			);

			await waitFor( () => {
				expect( mockedApi.createProduct ).toHaveBeenCalledWith(
					expect.objectContaining( { title: 'New Widget' } ),
				);
			} );
		} );

		it( 'calls onSaved after successful creation', async () => {
			mockedApi.createProduct.mockResolvedValueOnce( existingProduct );
			const user = userEvent.setup();

			render( <ProductForm { ...defaultProps } /> );

			await user.type( screen.getByLabelText( /^title$/i ), 'New Widget' );
			await user.click(
				screen.getByRole( 'button', { name: /create product/i } ),
			);

			await waitFor( () => {
				expect( defaultProps.onSaved ).toHaveBeenCalledWith(
					expect.stringContaining( 'created' ),
				);
			} );
		} );

		it( 'shows error notice when API call fails', async () => {
			mockedApi.createProduct.mockRejectedValueOnce(
				new Error( 'Server Error' ),
			);
			const user = userEvent.setup();

			render( <ProductForm { ...defaultProps } /> );

			await user.type( screen.getByLabelText( /^title$/i ), 'Fail Widget' );
			await user.click(
				screen.getByRole( 'button', { name: /create product/i } ),
			);

			await waitFor( () => {
				expect( defaultProps.setNotice ).toHaveBeenCalledWith(
					expect.objectContaining( { status: 'error' } ),
				);
			} );
		} );
	} );

	/* ---------- Edit mode ---------- */

	describe( 'Edit Product mode', () => {
		it( 'shows spinner while loading product', () => {
			mockedApi.getProduct.mockReturnValue( new Promise( () => {} ) );

			const { container } = render(
				<ProductForm { ...defaultProps } productId={ 42 } />,
			);

			expect(
				container.querySelector( '.jeec-loading' ),
			).toBeInTheDocument();
		} );

		it( 'renders "Edit Product" heading after loading', async () => {
			mockedApi.getProduct.mockResolvedValueOnce( existingProduct );

			render( <ProductForm { ...defaultProps } productId={ 42 } /> );

			await waitFor( () => {
				expect(
					screen.getByRole( 'heading', { name: /edit product/i } ),
				).toBeInTheDocument();
			} );
		} );

		it( 'populates form fields with existing product data', async () => {
			mockedApi.getProduct.mockResolvedValueOnce( existingProduct );

			render( <ProductForm { ...defaultProps } productId={ 42 } /> );

			await waitFor( () => {
				expect( screen.getByLabelText( /^title$/i ) ).toHaveValue(
					'Existing Widget',
				);
			} );
		} );

		it( 'renders "Update Product" button in edit mode', async () => {
			mockedApi.getProduct.mockResolvedValueOnce( existingProduct );

			render( <ProductForm { ...defaultProps } productId={ 42 } /> );

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: /update product/i } ),
				).toBeInTheDocument();
			} );
		} );

		it( 'calls updateProduct on edit submit', async () => {
			mockedApi.getProduct.mockResolvedValueOnce( existingProduct );
			mockedApi.updateProduct.mockResolvedValueOnce( {
				...existingProduct,
				title: 'Updated Widget',
			} );
			const user = userEvent.setup();

			render( <ProductForm { ...defaultProps } productId={ 42 } /> );

			await waitFor( () => {
				expect( screen.getByLabelText( /^title$/i ) ).toHaveValue(
					'Existing Widget',
				);
			} );

			await user.clear( screen.getByLabelText( /^title$/i ) );
			await user.type( screen.getByLabelText( /^title$/i ), 'Updated Widget' );

			await user.click(
				screen.getByRole( 'button', { name: /update product/i } ),
			);

			await waitFor( () => {
				expect( mockedApi.updateProduct ).toHaveBeenCalledWith(
					42,
					expect.objectContaining( { title: 'Updated Widget' } ),
				);
			} );
		} );

		it( 'calls onSaved with "updated" message after successful edit', async () => {
			mockedApi.getProduct.mockResolvedValueOnce( existingProduct );
			mockedApi.updateProduct.mockResolvedValueOnce( existingProduct );
			const user = userEvent.setup();

			render( <ProductForm { ...defaultProps } productId={ 42 } /> );

			await waitFor( () => {
				expect( screen.getByLabelText( /^title$/i ) ).toHaveValue(
					'Existing Widget',
				);
			} );

			await user.click(
				screen.getByRole( 'button', { name: /update product/i } ),
			);

			await waitFor( () => {
				expect( defaultProps.onSaved ).toHaveBeenCalledWith(
					expect.stringContaining( 'updated' ),
				);
			} );
		} );
	} );

	/* ---------- Navigation ---------- */

	describe( 'Navigation', () => {
		it( 'renders "← Back to Products" link', () => {
			render( <ProductForm { ...defaultProps } /> );

			expect(
				screen.getByRole( 'button', { name: /back to products/i } ),
			).toBeInTheDocument();
		} );

		it( 'calls onCancel when back link is clicked', async () => {
			const user = userEvent.setup();
			render( <ProductForm { ...defaultProps } /> );

			await user.click(
				screen.getByRole( 'button', { name: /back to products/i } ),
			);

			expect( defaultProps.onCancel ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'calls onCancel when Cancel button is clicked', async () => {
			const user = userEvent.setup();
			render( <ProductForm { ...defaultProps } /> );

			await user.click(
				screen.getByRole( 'button', { name: /^cancel$/i } ),
			);

			expect( defaultProps.onCancel ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
