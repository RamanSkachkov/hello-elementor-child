/**
 * Products Manager — React admin application entry point.
 *
 * Mounts the <App /> component into the #jeec-products-admin
 * container rendered by inc/admin-page.php.
 */

import { createRoot } from '@wordpress/element';
import App from './App';

import './style.scss';

const container = document.getElementById( 'jeec-products-admin' );

if ( container ) {
	createRoot( container ).render( <App /> );
}
