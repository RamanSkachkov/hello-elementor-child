/**
 * Unit tests for the DeleteConfirmModal component.
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DeleteConfirmModal from './DeleteConfirmModal';

/* Mock @wordpress/components — avoid loading the real heavy module.
 * We only need Button and Modal. */
jest.mock( '@wordpress/components', () => ( {
	Modal: ( { children, title, onRequestClose }: {
		children: React.ReactNode;
		title: string;
		onRequestClose: () => void;
	} ) => (
		<div data-testid="modal" role="dialog" aria-label={ title }>
			<button data-testid="modal-close" onClick={ onRequestClose }>
				Close
			</button>
			{ children }
		</div>
	),
	Button: ( {
		children,
		onClick,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		variant?: string;
		isDestructive?: boolean;
		isBusy?: boolean;
	} ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ children }
		</button>
	),
} ) );

describe( 'DeleteConfirmModal', () => {
	const defaultProps = {
		isDeleting: false,
		onConfirm: jest.fn(),
		onCancel: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders confirmation message', () => {
		render( <DeleteConfirmModal { ...defaultProps } /> );

		expect(
			screen.getByText( /are you sure you want to permanently delete/i ),
		).toBeInTheDocument();
	} );

	it( 'renders Delete and Cancel buttons', () => {
		render( <DeleteConfirmModal { ...defaultProps } /> );

		expect(
			screen.getByRole( 'button', { name: /delete/i } ),
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: /cancel/i } ),
		).toBeInTheDocument();
	} );

	it( 'calls onConfirm when Delete button is clicked', async () => {
		const user = userEvent.setup();
		render( <DeleteConfirmModal { ...defaultProps } /> );

		await user.click( screen.getByRole( 'button', { name: /delete/i } ) );

		expect( defaultProps.onConfirm ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls onCancel when Cancel button is clicked', async () => {
		const user = userEvent.setup();
		render( <DeleteConfirmModal { ...defaultProps } /> );

		await user.click( screen.getByRole( 'button', { name: /cancel/i } ) );

		expect( defaultProps.onCancel ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls onCancel when modal close is triggered', async () => {
		const user = userEvent.setup();
		render( <DeleteConfirmModal { ...defaultProps } /> );

		await user.click( screen.getByTestId( 'modal-close' ) );

		expect( defaultProps.onCancel ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables Cancel button while deleting', () => {
		render( <DeleteConfirmModal { ...defaultProps } isDeleting={ true } /> );

		expect(
			screen.getByRole( 'button', { name: /cancel/i } ),
		).toBeDisabled();
	} );
} );
