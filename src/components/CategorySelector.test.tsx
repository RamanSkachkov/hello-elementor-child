/**
 * Unit tests for the CategorySelector component.
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CategorySelector from './CategorySelector';
import type { Category } from '../types';

const mockCategories: Category[] = [
	{ id: 1, name: 'Electronics', slug: 'electronics', count: 5 },
	{ id: 2, name: 'Clothing', slug: 'clothing', count: 3 },
	{ id: 3, name: 'Books', slug: 'books', count: 12 },
];

describe( 'CategorySelector', () => {
	const defaultProps = {
		categories: mockCategories,
		selected: [] as number[],
		onChange: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders empty state when no categories exist', () => {
		render(
			<CategorySelector
				categories={ [] }
				selected={ [] }
				onChange={ jest.fn() }
			/>,
		);

		expect( screen.getByText( /no categories found/i ) ).toBeInTheDocument();
	} );

	it( 'renders a checkbox for each category', () => {
		render( <CategorySelector { ...defaultProps } /> );

		// CheckboxControl deprecation warning is emitted on first render.
		// @wordpress/jest-console requires us to acknowledge it.
		expect( console ).toHaveWarned();

		expect( screen.getByLabelText( 'Electronics' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Clothing' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Books' ) ).toBeInTheDocument();
	} );

	it( 'marks selected categories as checked', () => {
		render(
			<CategorySelector { ...defaultProps } selected={ [ 1, 3 ] } />,
		);

		expect( screen.getByLabelText( 'Electronics' ) ).toBeChecked();
		expect( screen.getByLabelText( 'Clothing' ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Books' ) ).toBeChecked();
	} );

	it( 'calls onChange with added category when checking', async () => {
		const onChange = jest.fn();
		const user = userEvent.setup();

		render(
			<CategorySelector
				categories={ mockCategories }
				selected={ [ 1 ] }
				onChange={ onChange }
			/>,
		);

		await user.click( screen.getByLabelText( 'Clothing' ) );

		expect( onChange ).toHaveBeenCalledWith( [ 1, 2 ] );
	} );

	it( 'calls onChange with removed category when unchecking', async () => {
		const onChange = jest.fn();
		const user = userEvent.setup();

		render(
			<CategorySelector
				categories={ mockCategories }
				selected={ [ 1, 2 ] }
				onChange={ onChange }
			/>,
		);

		await user.click( screen.getByLabelText( 'Electronics' ) );

		expect( onChange ).toHaveBeenCalledWith( [ 2 ] );
	} );

	it( 'renders inside a fieldset for accessibility', () => {
		const { container } = render(
			<CategorySelector { ...defaultProps } />,
		);

		const fieldset = container.querySelector( 'fieldset' );
		expect( fieldset ).toBeInTheDocument();
		expect( fieldset ).toHaveAttribute( 'aria-label', 'Product categories' );
	} );
} );
