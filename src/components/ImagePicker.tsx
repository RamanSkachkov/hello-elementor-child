/**
 * ImagePicker — opens the native WP Media Library frame
 * to select / replace / remove a featured image.
 */

import { useCallback } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface ImagePickerProps {
	readonly imageUrl: string;
	readonly onSelect: ( id: number, url: string ) => void;
	readonly onRemove: () => void;
}

export default function ImagePicker( {
	imageUrl,
	onSelect,
	onRemove,
}: ImagePickerProps ) {
	const openMediaFrame = useCallback( () => {
		const frame = wp.media( {
			title: __( 'Select Product Image', 'hello-elementor-child' ),
			multiple: false,
			library: { type: 'image' },
			button: { text: __( 'Use this image', 'hello-elementor-child' ) },
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			onSelect(
				attachment.id,
				attachment.sizes?.thumbnail?.url || attachment.url,
			);
		} );

		frame.open();
	}, [ onSelect ] );

	return (
		<div className="jeec-image-picker">
			<label>{ __( 'Main Image', 'hello-elementor-child' ) }</label>

			{ imageUrl && (
				<div className="jeec-image-preview">
					<img src={ imageUrl } alt="" />
				</div>
			) }

			<Button variant="secondary" onClick={ openMediaFrame }>
				{ imageUrl
					? __( 'Replace Image', 'hello-elementor-child' )
					: __( 'Select Image', 'hello-elementor-child' ) }
			</Button>

			{ imageUrl && (
				<Button variant="link" isDestructive onClick={ onRemove }>
					{ __( 'Remove', 'hello-elementor-child' ) }
				</Button>
			) }
		</div>
	);
}
