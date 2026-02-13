/**
 * CategorySelector — renders a scrollable list of checkboxes
 * for selecting product categories.
 */

import { useCallback } from '@wordpress/element';
import { CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import type { Category } from '../types';

interface CategorySelectorProps {
	readonly categories: Category[];
	readonly selected: number[];
	readonly onChange: ( ids: number[] ) => void;
}

export default function CategorySelector( {
	categories,
	selected,
	onChange,
}: CategorySelectorProps ) {
	const toggle = useCallback(
		( catId: number, checked: boolean ) => {
			onChange(
				checked
					? [ ...selected, catId ]
					: selected.filter( ( id ) => id !== catId ),
			);
		},
		[ selected, onChange ],
	);

	if ( categories.length === 0 ) {
		return (
			<p className="jeec-no-categories">
				{ __(
					'No categories found. Create them under Products → Categories.',
					'hello-elementor-child',
				) }
			</p>
		);
	}

	return (
		<fieldset className="jeec-categories-list" aria-label={ __( 'Product categories', 'hello-elementor-child' ) }>
			{ categories.map( ( cat ) => (
				<CheckboxControl
					key={ cat.id }
					label={ cat.name }
					checked={ selected.includes( cat.id ) }
					onChange={ ( checked: boolean ) => toggle( cat.id, checked ) }
				/>
			) ) }
		</fieldset>
	);
}
