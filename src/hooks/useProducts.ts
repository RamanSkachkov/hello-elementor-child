/**
 * Custom hook — manages the products list, loading state, and deletion.
 */

import { useState, useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import * as api from '../api/products';
import type { Product, AppNotice } from '../types';

interface UseProductsReturn {
	products: Product[];
	loading: boolean;
	refresh: () => void;
	removeProduct: (id: number) => Promise<void>;
}

export function useProducts(
	setNotice: (notice: AppNotice) => void,
): UseProductsReturn {
	const [ products, setProducts ] = useState<Product[]>( [] );
	const [ loading, setLoading ] = useState( true );

	const refresh = useCallback( () => {
		setLoading( true );
		api.getProducts()
			.then( setProducts )
			.catch( () => {
				setNotice( {
					status: 'error',
					message: __( 'Failed to load products.', 'hello-elementor-child' ),
				} );
			} )
			.finally( () => setLoading( false ) );
	}, [ setNotice ] );

	useEffect( () => {
		refresh();
	}, [ refresh ] );

	const removeProduct = useCallback( async ( id: number ) => {
		await api.deleteProduct( id );
		setProducts( ( prev ) => prev.filter( ( p ) => p.id !== id ) );
	}, [] );

	return { products, loading, refresh, removeProduct };
}
