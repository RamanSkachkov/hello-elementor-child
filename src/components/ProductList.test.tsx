/**
 * Unit tests for the ProductList component.
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProductList from './ProductList';
import * as api from '../api/products';
import type { Product } from '../types';

/* Mock the API layer. */
jest.mock( '../api/products' );

const mockedApi = api as jest.Mocked< typeof api >;

/* Mock the DeleteConfirmModal to simplify tests. */
jest.mock( './DeleteConfirmModal', () => {
	return function MockDeleteConfirmModal( {
		onConfirm,
		onCancel,
	}: {
		onConfirm: () => void;
		onCancel: () => void;
	} ) {
		return (
			<div data-testid="delete-modal">
				<button onClick={ onConfirm }>Confirm Delete</button>
				<button onClick={ onCancel }>Cancel Delete</button>
			</div>
		);
	};
} );

/* ----------------------------------------------------------------
 * Fixtures
 * -------------------------------------------------------------- */

const mockProducts: Product[] = [
	{
		id: 1,
		title: 'Widget A',
		description: 'Desc A',
		price: 29.99,
		sale_price: 0,
		is_on_sale: false,
		youtube_video: '',
		featured_image_id: 10,
		featured_image_url: 'http://localhost/img-a.jpg',
		categories: [],
		date: '2026-01-01',
		status: 'publish',
	},
	{
		id: 2,
		title: 'Gadget B',
		description: 'Desc B',
		price: 99.99,
		sale_price: 79.99,
		is_on_sale: true,
		youtube_video: 'https://youtube.com/watch?v=xyz',
		featured_image_id: 0,
		featured_image_url: '',
		categories: [ 1 ],
		date: '2026-01-02',
		status: 'publish',
	},
];

/* ----------------------------------------------------------------
 * Tests
 * -------------------------------------------------------------- */

describe( 'ProductList', () => {
	const defaultProps = {
		onAdd: jest.fn(),
		onEdit: jest.fn(),
		setNotice: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows a spinner while loading', () => {
		mockedApi.getProducts.mockReturnValue( new Promise( () => {} ) ); // never resolves

		const { container } = render( <ProductList { ...defaultProps } /> );

		expect( container.querySelector( '.jeec-loading' ) ).toBeInTheDocument();
	} );

	it( 'renders empty state when no products exist', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( [] );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect(
				screen.getByText( /no products found/i ),
			).toBeInTheDocument();
		} );
	} );

	it( 'renders "Add New Product" buttons in empty state (header + body)', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( [] );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			// There are 2 "Add New Product" buttons: in header and in empty state.
			expect(
				screen.getAllByRole( 'button', { name: /add new product/i } ),
			).toHaveLength( 2 );
		} );
	} );

	it( 'renders products in a table', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Widget A' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Gadget B' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders table headers (Image, Product Name, Price, Actions)', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Image' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Product Name' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Price' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Actions' ) ).toBeInTheDocument();
		} );
	} );

	it( 'shows "Sale" badge for on-sale products', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Sale' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders product thumbnail when available', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			const img = screen.getByAltText( 'Widget A' );
			expect( img ).toHaveAttribute( 'src', 'http://localhost/img-a.jpg' );
		} );
	} );

	it( 'renders placeholder when no thumbnail', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByLabelText( 'No image' ) ).toBeInTheDocument();
		} );
	} );

	it( 'calls onAdd when "Add New Product" button is clicked', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );
		const user = userEvent.setup();

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Widget A' ) ).toBeInTheDocument();
		} );

		await user.click(
			screen.getByRole( 'button', { name: /add new product/i } ),
		);

		expect( defaultProps.onAdd ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls onEdit with product ID when Edit button is clicked', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );
		const user = userEvent.setup();

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Widget A' ) ).toBeInTheDocument();
		} );

		const editButtons = screen.getAllByRole( 'button', { name: /^edit$/i } );
		await user.click( editButtons[ 0 ] );

		expect( defaultProps.onEdit ).toHaveBeenCalledWith( 1 );
	} );

	it( 'opens delete modal when Delete button is clicked', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );
		const user = userEvent.setup();

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Widget A' ) ).toBeInTheDocument();
		} );

		const deleteButtons = screen.getAllByRole( 'button', {
			name: /^delete$/i,
		} );
		await user.click( deleteButtons[ 0 ] );

		expect( screen.getByTestId( 'delete-modal' ) ).toBeInTheDocument();
	} );

	it( 'removes product from list after successful deletion', async () => {
		mockedApi.getProducts.mockResolvedValueOnce( mockProducts );
		mockedApi.deleteProduct.mockResolvedValueOnce( {
			deleted: true,
			id: 1,
		} );
		const user = userEvent.setup();

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Widget A' ) ).toBeInTheDocument();
		} );

		// Click delete on first product.
		const deleteButtons = screen.getAllByRole( 'button', {
			name: /^delete$/i,
		} );
		await user.click( deleteButtons[ 0 ] );

		// Confirm deletion.
		await user.click( screen.getByText( 'Confirm Delete' ) );

		await waitFor( () => {
			expect( screen.queryByText( 'Widget A' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'shows error notice when loading products fails', async () => {
		mockedApi.getProducts.mockRejectedValueOnce(
			new Error( 'Network Error' ),
		);

		render( <ProductList { ...defaultProps } /> );

		await waitFor( () => {
			expect( defaultProps.setNotice ).toHaveBeenCalledWith(
				expect.objectContaining( { status: 'error' } ),
			);
		} );
	} );
} );
