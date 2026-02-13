<?php
/**
 * Part 3 – User Setup.
 *
 * Creates the wp-test editor user on theme activation
 * and disables the admin bar for that user.
 *
 * @package HelloElementorChild
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create the wp-test editor user when the theme is activated.
 *
 * NOTE: Credentials are hardcoded per the test assignment requirements.
 * In production, user provisioning should be handled via WP-CLI,
 * environment variables, or a secure onboarding flow — never in code.
 */
function jeec_create_test_user() {
	if ( ! username_exists( 'wp-test' ) ) {
		$user_id = wp_create_user( 'wp-test', '123456789', 'wptest@elementor.com' );

		if ( ! is_wp_error( $user_id ) ) {
			$user = new WP_User( $user_id );
			$user->set_role( 'editor' );

			// Persist the "no admin bar" preference.
			update_user_meta( $user_id, 'show_admin_bar_front', 'false' );
		}
	}
}
add_action( 'after_switch_theme', 'jeec_create_test_user' );

/**
 * Disable the WordPress admin bar for the wp-test user.
 */
function jeec_disable_admin_bar_for_test_user() {
	$user = wp_get_current_user();

	if ( $user instanceof WP_User && 'wp-test' === $user->user_login ) {
		show_admin_bar( false );
	}
}
add_action( 'after_setup_theme', 'jeec_disable_admin_bar_for_test_user' );

/**
 * Filter: also disable admin bar via the show_admin_bar filter.
 *
 * @param bool $show Whether to show the admin bar.
 * @return bool
 */
function jeec_filter_admin_bar( $show ) {
	$user = wp_get_current_user();

	if ( $user instanceof WP_User && 'wp-test' === $user->user_login ) {
		return false;
	}

	return $show;
}
add_filter( 'show_admin_bar', 'jeec_filter_admin_bar' );
