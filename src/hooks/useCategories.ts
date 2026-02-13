/**
 * Custom hook — fetches all product categories once on mount.
 */

import { useState, useEffect } from '@wordpress/element';

import { getCategories } from '../api/products';
import type { Category } from '../types';

export function useCategories(): Category[] {
	const [ categories, setCategories ] = useState<Category[]>( [] );

	useEffect( () => {
		getCategories()
			.then( setCategories )
			.catch( () => {
				/* Categories are non-critical; silently ignore. */
			} );
	}, [] );

	return categories;
}
