<?php
/**
 * Part 5 – Admin Settings Page.
 *
 * Registers the "Products Manager" admin menu page
 * and enqueues the React app built with Gutenberg components.
 *
 * @package HelloElementorChild
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Products Manager admin menu page.
 */
function jeec_add_admin_menu() {
	add_menu_page(
		__( 'Products Manager', 'hello-elementor-child' ),
		__( 'Products Manager', 'hello-elementor-child' ),
		'edit_posts',
		'jeec-products',
		'jeec_render_admin_page',
		'dashicons-store',
		25
	);
}
add_action( 'admin_menu', 'jeec_add_admin_menu' );

/**
 * Render the admin page container – the React app mounts here.
 */
function jeec_render_admin_page() {
	echo '<div class="wrap">';
	echo '<div id="jeec-products-admin"></div>';
	echo '</div>';
}

/**
 * Enqueue the React admin app scripts and styles on our page only.
 *
 * @param string $hook The current admin page hook suffix.
 */
function jeec_enqueue_admin_scripts( $hook ) {
	if ( 'toplevel_page_jeec-products' !== $hook ) {
		return;
	}

	$asset_file = JEEC_PATH . '/build/index.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	// WordPress media uploader (for image selection).
	wp_enqueue_media();

	// React app script.
	wp_enqueue_script(
		'jeec-products-admin',
		JEEC_URL . '/build/index.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	// React app styles.
	wp_enqueue_style(
		'jeec-products-admin',
		JEEC_URL . '/build/style-index.css',
		[ 'wp-components' ],
		$asset['version']
	);

	// Pass configuration to the frontend.
	wp_localize_script( 'jeec-products-admin', 'jeecData', [
		'restUrl'   => esc_url_raw( rest_url( 'jeec/v1/' ) ),
		'restNonce' => wp_create_nonce( 'wp_rest' ),
		'adminUrl'  => admin_url(),
	] );
}
add_action( 'admin_enqueue_scripts', 'jeec_enqueue_admin_scripts' );
