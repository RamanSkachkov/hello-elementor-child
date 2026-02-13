/**
 * Unit tests for the root App component.
 *
 * Verifies screen routing between list, add, and edit views.
 */

import '@testing-library/jest-dom';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import * as api from './api/products';

jest.mock( './api/products' );

const mockedApi = api as jest.Mocked< typeof api >;

/* Mock sub-components to isolate App routing logic. */
jest.mock( './components/ProductList', () => {
	return function MockProductList( {
		onAdd,
		onEdit,
	}: {
		onAdd: () => void;
		onEdit: ( id: number ) => void;
	} ) {
		return (
			<div data-testid="product-list">
				<button onClick={ onAdd }>Add New Product</button>
				<button onClick={ () => onEdit( 42 ) }>Edit Product 42</button>
			</div>
		);
	};
} );

jest.mock( './components/ProductForm', () => {
	return function MockProductForm( {
		productId,
		onCancel,
		onSaved,
	}: {
		productId?: number | null;
		onCancel: () => void;
		onSaved: ( msg: string ) => void;
	} ) {
		return (
			<div data-testid="product-form">
				<span data-testid="form-mode">
					{ productId ? `edit-${ productId }` : 'add' }
				</span>
				<button onClick={ onCancel }>Cancel</button>
				<button onClick={ () => onSaved( 'Saved!' ) }>Save</button>
			</div>
		);
	};
} );

describe( 'App', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		/* ProductList internally calls getProducts via useProducts. */
		mockedApi.getProducts.mockResolvedValue( [] );
	} );

	it( 'renders the product list screen by default', () => {
		render( <App /> );

		expect( screen.getByTestId( 'product-list' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'product-form' ) ).not.toBeInTheDocument();
	} );

	it( 'navigates to "add" screen when Add is triggered', async () => {
		const user = userEvent.setup();
		render( <App /> );

		await user.click(
			screen.getByRole( 'button', { name: /add new product/i } ),
		);

		expect( screen.getByTestId( 'product-form' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'form-mode' ) ).toHaveTextContent( 'add' );
		expect( screen.queryByTestId( 'product-list' ) ).not.toBeInTheDocument();
	} );

	it( 'navigates to "edit" screen with correct product ID', async () => {
		const user = userEvent.setup();
		render( <App /> );

		await user.click(
			screen.getByRole( 'button', { name: /edit product 42/i } ),
		);

		expect( screen.getByTestId( 'product-form' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'form-mode' ) ).toHaveTextContent(
			'edit-42',
		);
	} );

	it( 'navigates back to list when Cancel is clicked in form', async () => {
		const user = userEvent.setup();
		render( <App /> );

		// Go to add screen.
		await user.click(
			screen.getByRole( 'button', { name: /add new product/i } ),
		);
		expect( screen.getByTestId( 'product-form' ) ).toBeInTheDocument();

		// Cancel.
		await user.click( screen.getByRole( 'button', { name: /cancel/i } ) );
		expect( screen.getByTestId( 'product-list' ) ).toBeInTheDocument();
	} );

	it( 'shows success notice and navigates to list after save', async () => {
		const user = userEvent.setup();
		render( <App /> );

		await user.click(
			screen.getByRole( 'button', { name: /add new product/i } ),
		);
		await user.click( screen.getByRole( 'button', { name: /save/i } ) );

		// Should be back on list.
		expect( screen.getByTestId( 'product-list' ) ).toBeInTheDocument();

		// Should show success notice — query within the app container
		// to avoid matching the aria-live region duplicate.
		const appContainer = screen.getByTestId( 'product-list' ).closest( '.jeec-products-app' )!;
		expect( within( appContainer ).getByText( 'Saved!' ) ).toBeInTheDocument();
	} );

	it( 'dismisses notice when close button is clicked', async () => {
		const user = userEvent.setup();
		render( <App /> );

		// Trigger a notice.
		await user.click(
			screen.getByRole( 'button', { name: /add new product/i } ),
		);
		await user.click( screen.getByRole( 'button', { name: /save/i } ) );

		const appContainer = screen.getByTestId( 'product-list' ).closest( '.jeec-products-app' )!;
		expect( within( appContainer ).getByText( 'Saved!' ) ).toBeInTheDocument();

		// Dismiss the notice — the WP Notice uses aria-label="Close".
		const closeButton = screen.getByRole( 'button', { name: /close/i } );
		await user.click( closeButton );

		await waitFor( () => {
			expect( within( appContainer ).queryByText( 'Saved!' ) ).not.toBeInTheDocument();
		} );
	} );
} );
