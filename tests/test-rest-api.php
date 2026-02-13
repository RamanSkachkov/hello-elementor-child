<?php
/**
 * PHPUnit tests for the custom REST API endpoints.
 *
 * Tests cover:
 *  - Route registration
 *  - List products (GET /jeec/v1/products)
 *  - Create product (POST /jeec/v1/products)
 *  - Get single product (GET /jeec/v1/products/<id>)
 *  - Update product (POST /jeec/v1/products/<id>)
 *  - Delete product (DELETE /jeec/v1/products/<id>)
 *  - 404 handling for non-existent products
 *  - Authentication / permission checks
 *  - List product categories (GET /jeec/v1/product-categories)
 *
 * @package HelloElementorChild
 */

class Test_JEEC_REST_API extends WP_UnitTestCase {

	/**
	 * @var WP_REST_Server
	 */
	protected $server;

	/**
	 * @var int  Admin user ID.
	 */
	protected $admin_id;

	/**
	 * REST namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'jeec/v1';

	/**
	 * Set up test fixtures.
	 */
	public function set_up() {
		parent::set_up();

		global $wp_rest_server;
		$this->server   = new WP_REST_Server();
		$wp_rest_server = $this->server;

		do_action( 'rest_api_init' );

		$this->admin_id = self::factory()->user->create( [
			'role' => 'administrator',
		] );
	}

	/**
	 * Tear down test fixtures.
	 */
	public function tear_down() {
		global $wp_rest_server;
		$wp_rest_server = null;

		parent::tear_down();
	}

	/* ------------------------------------------------------------------
	 * Route registration
	 * ---------------------------------------------------------------- */

	public function test_routes_are_registered() {
		$routes = $this->server->get_routes();

		$this->assertArrayHasKey( "/{$this->namespace}/products", $routes );
		$this->assertArrayHasKey( "/{$this->namespace}/products/(?P<id>\\d+)", $routes );
		$this->assertArrayHasKey( "/{$this->namespace}/product-categories", $routes );
	}

	/* ------------------------------------------------------------------
	 * GET /products
	 * ---------------------------------------------------------------- */

	public function test_get_products_returns_list() {
		wp_set_current_user( $this->admin_id );

		// Create two test products.
		self::factory()->post->create( [
			'post_type'   => 'product',
			'post_title'  => 'Widget A',
			'post_status' => 'publish',
		] );
		self::factory()->post->create( [
			'post_type'   => 'product',
			'post_title'  => 'Widget B',
			'post_status' => 'publish',
		] );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/products" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 2, $response->get_data() );
	}

	public function test_get_products_includes_meta() {
		wp_set_current_user( $this->admin_id );

		$product_id = self::factory()->post->create( [
			'post_type'   => 'product',
			'post_title'  => 'Gadget',
			'post_status' => 'publish',
		] );

		update_post_meta( $product_id, '_price', 29.99 );
		update_post_meta( $product_id, '_sale_price', 19.99 );
		update_post_meta( $product_id, '_is_on_sale', true );
		update_post_meta( $product_id, '_youtube_video', 'https://youtube.com/watch?v=abc' );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/products" );
		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 29.99, $data[0]['price'] );
		$this->assertEquals( 19.99, $data[0]['sale_price'] );
		$this->assertTrue( $data[0]['is_on_sale'] );
		$this->assertEquals( 'https://youtube.com/watch?v=abc', $data[0]['youtube_video'] );
	}

	public function test_get_products_respects_pagination() {
		wp_set_current_user( $this->admin_id );

		for ( $i = 0; $i < 5; $i++ ) {
			self::factory()->post->create( [
				'post_type'   => 'product',
				'post_title'  => "Product $i",
				'post_status' => 'publish',
			] );
		}

		$request = new WP_REST_Request( 'GET', "/{$this->namespace}/products" );
		$request->set_param( 'per_page', 2 );
		$request->set_param( 'page', 1 );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 2, $response->get_data() );
		$this->assertEquals( '5', $response->get_headers()['X-WP-Total'] );
		$this->assertEquals( '3', $response->get_headers()['X-WP-TotalPages'] );
	}

	/* ------------------------------------------------------------------
	 * POST /products (create)
	 * ---------------------------------------------------------------- */

	public function test_create_product() {
		wp_set_current_user( $this->admin_id );

		$request = new WP_REST_Request( 'POST', "/{$this->namespace}/products" );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( [
			'title'         => 'New Product',
			'description'   => 'A fantastic product.',
			'price'         => 49.99,
			'sale_price'    => 39.99,
			'is_on_sale'    => true,
			'youtube_video' => 'https://youtube.com/watch?v=xyz',
			'categories'    => [],
		] ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 201, $response->get_status() );

		$data = $response->get_data();
		$this->assertEquals( 'New Product', $data['title'] );
		$this->assertEquals( 49.99, $data['price'] );
		$this->assertEquals( 39.99, $data['sale_price'] );
		$this->assertTrue( $data['is_on_sale'] );
		$this->assertNotEmpty( $data['id'] );
	}

	public function test_create_product_with_categories() {
		wp_set_current_user( $this->admin_id );

		$term = wp_insert_term( 'Electronics', 'product_category' );

		$request = new WP_REST_Request( 'POST', "/{$this->namespace}/products" );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( [
			'title'      => 'Phone',
			'categories' => [ $term['term_id'] ],
		] ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 201, $response->get_status() );
		$this->assertContains( $term['term_id'], $response->get_data()['categories'] );
	}

	/* ------------------------------------------------------------------
	 * GET /products/<id>
	 * ---------------------------------------------------------------- */

	public function test_get_single_product() {
		wp_set_current_user( $this->admin_id );

		$product_id = self::factory()->post->create( [
			'post_type'   => 'product',
			'post_title'  => 'Single Widget',
			'post_status' => 'publish',
		] );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/products/{$product_id}" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 'Single Widget', $response->get_data()['title'] );
	}

	public function test_get_nonexistent_product_returns_404() {
		wp_set_current_user( $this->admin_id );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/products/99999" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 404, $response->get_status() );
	}

	/* ------------------------------------------------------------------
	 * POST /products/<id> (update)
	 * ---------------------------------------------------------------- */

	public function test_update_product() {
		wp_set_current_user( $this->admin_id );

		$product_id = self::factory()->post->create( [
			'post_type'   => 'product',
			'post_title'  => 'Old Title',
			'post_status' => 'publish',
		] );
		update_post_meta( $product_id, '_price', 10.00 );

		$request = new WP_REST_Request( 'POST', "/{$this->namespace}/products/{$product_id}" );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( [
			'title' => 'Updated Title',
			'price' => 39.99,
		] ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'Updated Title', $data['title'] );
		$this->assertEquals( 39.99, $data['price'] );
	}

	public function test_update_nonexistent_product_returns_404() {
		wp_set_current_user( $this->admin_id );

		$request = new WP_REST_Request( 'POST', "/{$this->namespace}/products/99999" );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( [ 'title' => 'Ghost' ] ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 404, $response->get_status() );
	}

	/* ------------------------------------------------------------------
	 * DELETE /products/<id>
	 * ---------------------------------------------------------------- */

	public function test_delete_product() {
		wp_set_current_user( $this->admin_id );

		$product_id = self::factory()->post->create( [
			'post_type'   => 'product',
			'post_title'  => 'To Delete',
			'post_status' => 'publish',
		] );

		$request  = new WP_REST_Request( 'DELETE', "/{$this->namespace}/products/{$product_id}" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $response->get_data()['deleted'] );
		$this->assertNull( get_post( $product_id ) );
	}

	public function test_delete_nonexistent_product_returns_404() {
		wp_set_current_user( $this->admin_id );

		$request  = new WP_REST_Request( 'DELETE', "/{$this->namespace}/products/99999" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 404, $response->get_status() );
	}

	/* ------------------------------------------------------------------
	 * Permission checks
	 * ---------------------------------------------------------------- */

	public function test_unauthenticated_user_is_forbidden() {
		wp_set_current_user( 0 );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/products" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_subscriber_is_forbidden() {
		$subscriber_id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $subscriber_id );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/products" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 403, $response->get_status() );
	}

	/* ------------------------------------------------------------------
	 * GET /product-categories
	 * ---------------------------------------------------------------- */

	public function test_get_categories() {
		wp_set_current_user( $this->admin_id );

		wp_insert_term( 'Clothing', 'product_category' );
		wp_insert_term( 'Electronics', 'product_category' );

		$request  = new WP_REST_Request( 'GET', "/{$this->namespace}/product-categories" );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data  = $response->get_data();
		$names = wp_list_pluck( $data, 'name' );

		$this->assertContains( 'Clothing', $names );
		$this->assertContains( 'Electronics', $names );
	}
}
