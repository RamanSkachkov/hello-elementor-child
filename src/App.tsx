/**
 * Root application component.
 *
 * Manages screen routing (list → add / edit) and top-level notices.
 */

import { useState, useCallback } from '@wordpress/element';
import { Notice } from '@wordpress/components';

import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import type { AppNotice, Screen } from './types';

export default function App() {
	const [ screen, setScreen ] = useState<Screen>( 'list' );
	const [ editingId, setEditingId ] = useState<number | null>( null );
	const [ notice, setNotice ] = useState<AppNotice | null>( null );

	/* Navigation helpers */
	const navigateToList = useCallback( () => {
		setScreen( 'list' );
		setEditingId( null );
	}, [] );

	const navigateToAdd = useCallback( () => {
		setScreen( 'add' );
		setEditingId( null );
	}, [] );

	const navigateToEdit = useCallback( ( id: number ) => {
		setScreen( 'edit' );
		setEditingId( id );
	}, [] );

	const handleSaved = useCallback(
		( message: string ) => {
			setNotice( { status: 'success', message } );
			navigateToList();
		},
		[ navigateToList ],
	);

	return (
		<div className="jeec-products-app">
			{ notice && (
				<Notice
					status={ notice.status }
					isDismissible
					onRemove={ () => setNotice( null ) }
				>
					{ notice.message }
				</Notice>
			) }

			{ screen === 'list' && (
				<ProductList
					onAdd={ navigateToAdd }
					onEdit={ navigateToEdit }
					setNotice={ setNotice }
				/>
			) }

			{ screen === 'add' && (
				<ProductForm
					onCancel={ navigateToList }
					onSaved={ handleSaved }
					setNotice={ setNotice }
				/>
			) }

			{ screen === 'edit' && (
				<ProductForm
					productId={ editingId }
					onCancel={ navigateToList }
					onSaved={ handleSaved }
					setNotice={ setNotice }
				/>
			) }
		</div>
	);
}
