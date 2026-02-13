<?php
/**
 * PHPUnit bootstrap file for the Hello Elementor Child theme tests.
 *
 * Requires the WordPress PHPUnit test library.
 * Set WP_TESTS_DIR to the path of your wordpress-develop/tests/phpunit/ directory
 * or it defaults to /tmp/wordpress-tests-lib.
 *
 * @package HelloElementorChild
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Forward PHPUnit Polyfills configuration.
$_phpunit_polyfills_path = getenv( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' );
if ( false !== $_phpunit_polyfills_path ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path );
}

if ( ! file_exists( "{$_tests_dir}/includes/functions.php" ) ) {
	echo "Could not find {$_tests_dir}/includes/functions.php – have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit( 1 );
}

// Access to tests_add_filter().
require_once "{$_tests_dir}/includes/functions.php";

/**
 * Manually load the child theme's functions.php for testing.
 */
function _manually_load_theme() {
	// Register post types and taxonomies.
	require dirname( __DIR__ ) . '/inc/post-types.php';

	// Register REST routes.
	require dirname( __DIR__ ) . '/inc/rest-api.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_theme' );

// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";
