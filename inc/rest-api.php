<?php
/**
 * Part 5 – Custom REST API Endpoints.
 *
 * Provides a clean, streamlined REST API for the React admin app
 * to perform CRUD operations on Products.
 *
 * Endpoints:
 *   GET    /jeec/v1/products              – List products
 *   POST   /jeec/v1/products              – Create product
 *   GET    /jeec/v1/products/<id>          – Get single product
 *   POST   /jeec/v1/products/<id>          – Update product
 *   DELETE /jeec/v1/products/<id>          – Delete product
 *   GET    /jeec/v1/product-categories    – List product categories
 *
 * @package HelloElementorChild
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register all custom REST routes.
 */
function jeec_register_rest_routes() {
	$namespace = 'jeec/v1';

	// Products collection.
	register_rest_route( $namespace, '/products', [
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'jeec_rest_get_products',
			'permission_callback' => 'jeec_rest_permission_check',
			'args'                => [
				'per_page' => [
					'default'           => 20,
					'sanitize_callback' => 'absint',
				],
				'page'     => [
					'default'           => 1,
					'sanitize_callback' => 'absint',
				],
				'search'   => [
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		],
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'jeec_rest_create_product',
			'permission_callback' => 'jeec_rest_permission_check',
		],
	] );

	// Single product.
	register_rest_route( $namespace, '/products/(?P<id>\d+)', [
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'jeec_rest_get_product',
			'permission_callback' => 'jeec_rest_permission_check',
			'args'                => [
				'id' => [
					'validate_callback' => function ( $param ) {
						return is_numeric( $param );
					},
				],
			],
		],
		[
			'methods'             => WP_REST_Server::EDITABLE,
			'callback'            => 'jeec_rest_update_product',
			'permission_callback' => 'jeec_rest_permission_check',
		],
		[
			'methods'             => WP_REST_Server::DELETABLE,
			'callback'            => 'jeec_rest_delete_product',
			'permission_callback' => 'jeec_rest_permission_check',
		],
	] );

	// Product categories.
	register_rest_route( $namespace, '/product-categories', [
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'jeec_rest_get_categories',
			'permission_callback' => 'jeec_rest_permission_check',
		],
	] );
}
add_action( 'rest_api_init', 'jeec_register_rest_routes' );

/**
 * Permission check – user must be able to edit posts.
 *
 * @return bool|WP_Error
 */
function jeec_rest_permission_check() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return new WP_Error(
			'rest_forbidden',
			__( 'Sorry, you are not allowed to access this endpoint.', 'hello-elementor-child' ),
			[ 'status' => 403 ]
		);
	}
	return true;
}

/**
 * Format a product WP_Post into a clean associative array.
 *
 * @param WP_Post $post The product post object.
 * @return array
 */
function jeec_format_product( $post ) {
	$thumbnail_id  = get_post_thumbnail_id( $post->ID );
	$thumbnail_url = '';

	if ( $thumbnail_id ) {
		$image = wp_get_attachment_image_src( $thumbnail_id, 'thumbnail' );
		if ( $image ) {
			$thumbnail_url = $image[0];
		}
	}

	$categories = wp_get_post_terms( $post->ID, 'product_category', [ 'fields' => 'ids' ] );

	return [
		'id'                 => $post->ID,
		'title'              => $post->post_title,
		'description'        => $post->post_content,
		'price'              => (float) get_post_meta( $post->ID, '_price', true ),
		'sale_price'         => (float) get_post_meta( $post->ID, '_sale_price', true ),
		'is_on_sale'         => (bool) get_post_meta( $post->ID, '_is_on_sale', true ),
		'youtube_video'      => (string) get_post_meta( $post->ID, '_youtube_video', true ),
		'featured_image_id'  => (int) $thumbnail_id,
		'featured_image_url' => $thumbnail_url,
		'categories'         => is_wp_error( $categories ) ? [] : $categories,
		'date'               => $post->post_date,
		'status'             => $post->post_status,
	];
}

/**
 * GET /jeec/v1/products – List all products.
 *
 * @param WP_REST_Request $request Full request object.
 * @return WP_REST_Response
 */
function jeec_rest_get_products( WP_REST_Request $request ) {
	$args = [
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'posts_per_page' => $request->get_param( 'per_page' ),
		'paged'          => $request->get_param( 'page' ),
		'orderby'        => 'date',
		'order'          => 'DESC',
	];

	$search = $request->get_param( 'search' );
	if ( ! empty( $search ) ) {
		$args['s'] = $search;
	}

	$query    = new WP_Query( $args );
	$products = [];

	foreach ( $query->posts as $post ) {
		$products[] = jeec_format_product( $post );
	}

	$response = new WP_REST_Response( $products );
	$response->header( 'X-WP-Total', $query->found_posts );
	$response->header( 'X-WP-TotalPages', $query->max_num_pages );

	return $response;
}

/**
 * GET /jeec/v1/products/<id> – Retrieve a single product.
 *
 * @param WP_REST_Request $request Full request object.
 * @return array|WP_Error
 */
function jeec_rest_get_product( WP_REST_Request $request ) {
	$post = get_post( (int) $request->get_param( 'id' ) );

	if ( ! $post || 'product' !== $post->post_type ) {
		return new WP_Error(
			'not_found',
			__( 'Product not found.', 'hello-elementor-child' ),
			[ 'status' => 404 ]
		);
	}

	return jeec_format_product( $post );
}

/**
 * POST /jeec/v1/products – Create a new product.
 *
 * @param WP_REST_Request $request Full request object.
 * @return WP_REST_Response|WP_Error
 */
function jeec_rest_create_product( WP_REST_Request $request ) {
	$params = $request->get_json_params();

	$post_data = [
		'post_type'    => 'product',
		'post_status'  => 'publish',
		'post_title'   => sanitize_text_field( $params['title'] ?? '' ),
		'post_content' => wp_kses_post( $params['description'] ?? '' ),
	];

	$post_id = wp_insert_post( $post_data, true );

	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}

	jeec_update_product_meta( $post_id, $params );

	return new WP_REST_Response( jeec_format_product( get_post( $post_id ) ), 201 );
}

/**
 * POST|PUT|PATCH /jeec/v1/products/<id> – Update an existing product.
 *
 * @param WP_REST_Request $request Full request object.
 * @return array|WP_Error
 */
function jeec_rest_update_product( WP_REST_Request $request ) {
	$post_id = (int) $request->get_param( 'id' );
	$post    = get_post( $post_id );

	if ( ! $post || 'product' !== $post->post_type ) {
		return new WP_Error(
			'not_found',
			__( 'Product not found.', 'hello-elementor-child' ),
			[ 'status' => 404 ]
		);
	}

	$params    = $request->get_json_params();
	$post_data = [ 'ID' => $post_id ];

	if ( isset( $params['title'] ) ) {
		$post_data['post_title'] = sanitize_text_field( $params['title'] );
	}

	if ( isset( $params['description'] ) ) {
		$post_data['post_content'] = wp_kses_post( $params['description'] );
	}

	wp_update_post( $post_data );
	jeec_update_product_meta( $post_id, $params );

	return jeec_format_product( get_post( $post_id ) );
}

/**
 * DELETE /jeec/v1/products/<id> – Delete a product permanently.
 *
 * @param WP_REST_Request $request Full request object.
 * @return WP_REST_Response|WP_Error
 */
function jeec_rest_delete_product( WP_REST_Request $request ) {
	$post_id = (int) $request->get_param( 'id' );
	$post    = get_post( $post_id );

	if ( ! $post || 'product' !== $post->post_type ) {
		return new WP_Error(
			'not_found',
			__( 'Product not found.', 'hello-elementor-child' ),
			[ 'status' => 404 ]
		);
	}

	$result = wp_delete_post( $post_id, true );

	if ( ! $result ) {
		return new WP_Error(
			'delete_failed',
			__( 'Failed to delete product.', 'hello-elementor-child' ),
			[ 'status' => 500 ]
		);
	}

	return new WP_REST_Response( [
		'deleted' => true,
		'id'      => $post_id,
	] );
}

/**
 * Helper: update product meta fields + taxonomy terms.
 *
 * @param int   $post_id The product post ID.
 * @param array $params  Associative array of field values.
 */
function jeec_update_product_meta( $post_id, $params ) {
	if ( isset( $params['price'] ) ) {
		update_post_meta( $post_id, '_price', floatval( $params['price'] ) );
	}

	if ( isset( $params['sale_price'] ) ) {
		update_post_meta( $post_id, '_sale_price', floatval( $params['sale_price'] ) );
	}

	if ( isset( $params['is_on_sale'] ) ) {
		update_post_meta( $post_id, '_is_on_sale', (bool) $params['is_on_sale'] );
	}

	if ( isset( $params['youtube_video'] ) ) {
		update_post_meta( $post_id, '_youtube_video', esc_url_raw( $params['youtube_video'] ) );
	}

	if ( isset( $params['featured_image_id'] ) ) {
		$image_id = (int) $params['featured_image_id'];
		if ( $image_id ) {
			set_post_thumbnail( $post_id, $image_id );
		} else {
			delete_post_thumbnail( $post_id );
		}
	}

	if ( isset( $params['categories'] ) && is_array( $params['categories'] ) ) {
		wp_set_object_terms( $post_id, array_map( 'intval', $params['categories'] ), 'product_category' );
	}
}

/**
 * GET /jeec/v1/product-categories – List all product categories.
 *
 * @param WP_REST_Request $request Full request object.
 * @return array
 */
function jeec_rest_get_categories( WP_REST_Request $request ) {
	$terms = get_terms( [
		'taxonomy'   => 'product_category',
		'hide_empty' => false,
	] );

	if ( is_wp_error( $terms ) ) {
		return [];
	}

	return array_map( function ( $term ) {
		return [
			'id'    => $term->term_id,
			'name'  => $term->name,
			'slug'  => $term->slug,
			'count' => $term->count,
		];
	}, $terms );
}
