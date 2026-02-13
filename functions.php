<?php
/**
 * Hello Elementor Child Theme functions and definitions.
 *
 * @package HelloElementorChild
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'JEEC_VERSION', '1.0.0' );
define( 'JEEC_PATH', get_stylesheet_directory() );
define( 'JEEC_URL', get_stylesheet_directory_uri() );

/**
 * Enqueue parent and child theme styles.
 */
function jeec_enqueue_styles() {
	wp_enqueue_style(
		'hello-elementor',
		get_template_directory_uri() . '/style.css',
		[],
		JEEC_VERSION
	);

	wp_enqueue_style(
		'hello-elementor-child',
		get_stylesheet_uri(),
		[ 'hello-elementor' ],
		JEEC_VERSION
	);
}
add_action( 'wp_enqueue_scripts', 'jeec_enqueue_styles' );

// Part 3 – User setup.
require_once JEEC_PATH . '/inc/user-setup.php';

// Part 4 – Custom Post Types & Taxonomies.
require_once JEEC_PATH . '/inc/post-types.php';
