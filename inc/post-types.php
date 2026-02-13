<?php
/**
 * Part 4 – Custom Post Types & Taxonomies.
 *
 * Registers the "Products" CPT, "Categories" taxonomy,
 * and product meta fields exposed via the REST API.
 *
 * @package HelloElementorChild
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Products custom post type.
 */
function jeec_register_products_cpt() {
	$labels = [
		'name'                  => __( 'Products', 'hello-elementor-child' ),
		'singular_name'         => __( 'Product', 'hello-elementor-child' ),
		'menu_name'             => __( 'Products', 'hello-elementor-child' ),
		'add_new'               => __( 'Add New', 'hello-elementor-child' ),
		'add_new_item'          => __( 'Add New Product', 'hello-elementor-child' ),
		'edit_item'             => __( 'Edit Product', 'hello-elementor-child' ),
		'new_item'              => __( 'New Product', 'hello-elementor-child' ),
		'view_item'             => __( 'View Product', 'hello-elementor-child' ),
		'search_items'          => __( 'Search Products', 'hello-elementor-child' ),
		'not_found'             => __( 'No products found', 'hello-elementor-child' ),
		'not_found_in_trash'    => __( 'No products found in Trash', 'hello-elementor-child' ),
		'all_items'             => __( 'All Products', 'hello-elementor-child' ),
	];

	$args = [
		'labels'              => $labels,
		'public'              => true,
		'publicly_queryable'  => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'query_var'           => true,
		'rewrite'             => [ 'slug' => 'products' ],
		'capability_type'     => 'post',
		'has_archive'         => true,
		'hierarchical'        => false,
		'menu_position'       => 20,
		'menu_icon'           => 'dashicons-cart',
		'supports'            => [ 'title', 'editor', 'thumbnail', 'custom-fields' ],
		'show_in_rest'        => true,
		'rest_base'           => 'products',
	];

	register_post_type( 'product', $args );
}
add_action( 'init', 'jeec_register_products_cpt' );

/**
 * Register the Categories taxonomy linked to Products.
 */
function jeec_register_product_categories_taxonomy() {
	$labels = [
		'name'                       => __( 'Categories', 'hello-elementor-child' ),
		'singular_name'              => __( 'Category', 'hello-elementor-child' ),
		'search_items'               => __( 'Search Categories', 'hello-elementor-child' ),
		'popular_items'              => __( 'Popular Categories', 'hello-elementor-child' ),
		'all_items'                  => __( 'All Categories', 'hello-elementor-child' ),
		'parent_item'                => __( 'Parent Category', 'hello-elementor-child' ),
		'parent_item_colon'          => __( 'Parent Category:', 'hello-elementor-child' ),
		'edit_item'                  => __( 'Edit Category', 'hello-elementor-child' ),
		'update_item'                => __( 'Update Category', 'hello-elementor-child' ),
		'add_new_item'               => __( 'Add New Category', 'hello-elementor-child' ),
		'new_item_name'              => __( 'New Category Name', 'hello-elementor-child' ),
		'separate_items_with_commas' => __( 'Separate categories with commas', 'hello-elementor-child' ),
		'add_or_remove_items'        => __( 'Add or remove categories', 'hello-elementor-child' ),
		'choose_from_most_used'      => __( 'Choose from the most used categories', 'hello-elementor-child' ),
		'not_found'                  => __( 'No categories found.', 'hello-elementor-child' ),
		'menu_name'                  => __( 'Categories', 'hello-elementor-child' ),
	];

	$args = [
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => [ 'slug' => 'product-category' ],
		'show_in_rest'      => true,
		'rest_base'         => 'product-categories',
	];

	register_taxonomy( 'product_category', [ 'product' ], $args );
}
add_action( 'init', 'jeec_register_product_categories_taxonomy' );

/**
 * Register product meta fields so they are available via REST API.
 */
function jeec_register_product_meta() {
	$meta_fields = [
		'_price'         => [
			'type'        => 'number',
			'description' => 'Product price',
			'single'      => true,
			'default'     => 0,
		],
		'_sale_price'    => [
			'type'        => 'number',
			'description' => 'Product sale price',
			'single'      => true,
			'default'     => 0,
		],
		'_is_on_sale'    => [
			'type'        => 'boolean',
			'description' => 'Whether the product is on sale',
			'single'      => true,
			'default'     => false,
		],
		'_youtube_video' => [
			'type'        => 'string',
			'description' => 'YouTube video URL',
			'single'      => true,
			'default'     => '',
		],
	];

	foreach ( $meta_fields as $key => $field ) {
		register_post_meta( 'product', $key, [
			'type'              => $field['type'],
			'description'       => $field['description'],
			'single'            => $field['single'],
			'default'           => $field['default'],
			'show_in_rest'      => true,
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		] );
	}
}
add_action( 'init', 'jeec_register_product_meta' );
