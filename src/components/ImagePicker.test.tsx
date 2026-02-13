/**
 * Unit tests for the ImagePicker component.
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ImagePicker from './ImagePicker';

describe( 'ImagePicker', () => {
	const defaultProps = {
		imageUrl: '',
		onSelect: jest.fn(),
		onRemove: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders "Select Image" button when no image is set', () => {
		render( <ImagePicker { ...defaultProps } /> );

		expect(
			screen.getByRole( 'button', { name: /select image/i } ),
		).toBeInTheDocument();
	} );

	it( 'does not render preview or Remove when no image is set', () => {
		const { container } = render( <ImagePicker { ...defaultProps } /> );

		expect( container.querySelector( '.jeec-image-preview' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /remove/i } ) ).not.toBeInTheDocument();
	} );

	it( 'renders image preview when imageUrl is provided', () => {
		const { container } = render(
			<ImagePicker
				{ ...defaultProps }
				imageUrl="http://example.com/photo.jpg"
			/>,
		);

		// Image has alt="" which gives it role="presentation", so query via tag.
		const img = container.querySelector( 'img' );
		expect( img ).toBeInTheDocument();
		expect( img ).toHaveAttribute( 'src', 'http://example.com/photo.jpg' );
	} );

	it( 'renders "Replace Image" button when image exists', () => {
		render(
			<ImagePicker
				{ ...defaultProps }
				imageUrl="http://example.com/photo.jpg"
			/>,
		);

		expect(
			screen.getByRole( 'button', { name: /replace image/i } ),
		).toBeInTheDocument();
	} );

	it( 'renders "Remove" button when image exists', () => {
		render(
			<ImagePicker
				{ ...defaultProps }
				imageUrl="http://example.com/photo.jpg"
			/>,
		);

		expect(
			screen.getByRole( 'button', { name: /remove/i } ),
		).toBeInTheDocument();
	} );

	it( 'calls onRemove when Remove button is clicked', async () => {
		const user = userEvent.setup();
		render(
			<ImagePicker
				{ ...defaultProps }
				imageUrl="http://example.com/photo.jpg"
			/>,
		);

		await user.click( screen.getByRole( 'button', { name: /remove/i } ) );

		expect( defaultProps.onRemove ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'opens wp.media frame when Select Image is clicked', async () => {
		const user = userEvent.setup();
		render( <ImagePicker { ...defaultProps } /> );

		await user.click(
			screen.getByRole( 'button', { name: /select image/i } ),
		);

		expect( wp.media ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'Select Product Image',
				multiple: false,
				library: { type: 'image' },
			} ),
		);
	} );

	it( 'renders "Main Image" label', () => {
		render( <ImagePicker { ...defaultProps } /> );

		expect( screen.getByText( /main image/i ) ).toBeInTheDocument();
	} );
} );
