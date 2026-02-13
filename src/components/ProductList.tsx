/**
 * ProductList — displays all products in a table with
 * thumbnail, name, price, and edit/delete actions.
 */

import { useState, useCallback } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useProducts } from '../hooks/useProducts';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { AppNotice } from '../types';

interface ProductListProps {
	readonly onAdd: () => void;
	readonly onEdit: ( id: number ) => void;
	readonly setNotice: ( notice: AppNotice ) => void;
}

export default function ProductList( {
	onAdd,
	onEdit,
	setNotice,
}: ProductListProps ) {
	const { products, loading, removeProduct } = useProducts( setNotice );

	const [ deletingId, setDeletingId ] = useState<number | null>( null );
	const [ isDeleting, setIsDeleting ] = useState( false );

	const handleConfirmDelete = useCallback( async () => {
		if ( deletingId === null ) return;

		setIsDeleting( true );
		try {
			await removeProduct( deletingId );
			setNotice( {
				status: 'success',
				message: __( 'Product deleted.', 'hello-elementor-child' ),
			} );
		} catch {
			setNotice( {
				status: 'error',
				message: __( 'Failed to delete product.', 'hello-elementor-child' ),
			} );
		} finally {
			setIsDeleting( false );
			setDeletingId( null );
		}
	}, [ deletingId, removeProduct, setNotice ] );

	/* -------------------------------------------------------------- */

	if ( loading ) {
		return (
			<div className="jeec-loading">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			{ /* Header */ }
			<div className="jeec-header">
				<h1>{ __( 'Products', 'hello-elementor-child' ) }</h1>
				<Button variant="primary" onClick={ onAdd }>
					{ __( 'Add New Product', 'hello-elementor-child' ) }
				</Button>
			</div>

			{ products.length === 0 ? (
				<div className="jeec-empty-state">
					<p>
						{ __(
							'No products found. Create your first product!',
							'hello-elementor-child',
						) }
					</p>
					<Button variant="primary" onClick={ onAdd }>
						{ __( 'Add New Product', 'hello-elementor-child' ) }
					</Button>
				</div>
			) : (
				<table className="jeec-products-table">
					<thead>
						<tr>
							<th className="thumbnail-cell">
								{ __( 'Image', 'hello-elementor-child' ) }
							</th>
							<th>
								{ __( 'Product Name', 'hello-elementor-child' ) }
							</th>
							<th className="price-cell">
								{ __( 'Price', 'hello-elementor-child' ) }
							</th>
							<th className="actions-cell">
								{ __( 'Actions', 'hello-elementor-child' ) }
							</th>
						</tr>
					</thead>
					<tbody>
						{ products.map( ( product ) => (
							<tr key={ product.id }>
								<td className="thumbnail-cell">
									{ product.featured_image_url ? (
										<img
											src={ product.featured_image_url }
											alt={ product.title }
										/>
									) : (
										<span
											className="thumbnail-placeholder"
											aria-label={ __(
												'No image',
												'hello-elementor-child',
											) }
										>
											&#128247;
										</span>
									) }
								</td>
								<td>
									<strong>{ product.title }</strong>
									{ product.is_on_sale && (
										<span className="sale-badge">
											{ __( 'Sale', 'hello-elementor-child' ) }
										</span>
									) }
								</td>
								<td className="price-cell">
									{ product.is_on_sale ? (
										<>
											<s>
												${ Number( product.price ).toFixed( 2 ) }
											</s>{ ' ' }
											<strong>
												${ Number( product.sale_price ).toFixed( 2 ) }
											</strong>
										</>
									) : (
										<>${ Number( product.price ).toFixed( 2 ) }</>
									) }
								</td>
								<td className="actions-cell">
									<Button
										variant="secondary"
										size="small"
										onClick={ () => onEdit( product.id ) }
									>
										{ __( 'Edit', 'hello-elementor-child' ) }
									</Button>
									<Button
										variant="secondary"
										isDestructive
										size="small"
										onClick={ () =>
											setDeletingId( product.id )
										}
									>
										{ __( 'Delete', 'hello-elementor-child' ) }
									</Button>
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			) }

			{ /* Delete confirmation */ }
			{ deletingId !== null && (
				<DeleteConfirmModal
					isDeleting={ isDeleting }
					onConfirm={ handleConfirmDelete }
					onCancel={ () => setDeletingId( null ) }
				/>
			) }
		</>
	);
}
