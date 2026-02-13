/**
 * ProductForm — handles both "Add New" and "Edit" product screens.
 *
 * Fields: Main image, Title, Description, Price, Sale price,
 *         Is on sale, YouTube video, Category.
 */

import { useState, useEffect, useCallback } from '@wordpress/element';
import {
	Button,
	TextControl,
	TextareaControl,
	ToggleControl,
	Panel,
	PanelBody,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import * as api from '../api/products';
import { useCategories } from '../hooks/useCategories';
import ImagePicker from './ImagePicker';
import CategorySelector from './CategorySelector';
import type { AppNotice, ProductPayload } from '../types';

interface ProductFormProps {
	readonly productId?: number | null;
	readonly onCancel: () => void;
	readonly onSaved: ( message: string ) => void;
	readonly setNotice: ( notice: AppNotice ) => void;
}

/** Empty form state. */
const INITIAL_STATE: ProductPayload & { featuredImageUrl: string } = {
	title: '',
	description: '',
	price: 0,
	sale_price: 0,
	is_on_sale: false,
	youtube_video: '',
	featured_image_id: 0,
	featuredImageUrl: '',
	categories: [],
};

export default function ProductForm( {
	productId,
	onCancel,
	onSaved,
	setNotice,
}: ProductFormProps ) {
	/* ----------------------------------------------------------------
	 * Form state
	 * -------------------------------------------------------------- */

	const [ title, setTitle ] = useState( INITIAL_STATE.title );
	const [ description, setDescription ] = useState( INITIAL_STATE.description );
	const [ price, setPrice ] = useState( '' );
	const [ salePrice, setSalePrice ] = useState( '' );
	const [ isOnSale, setIsOnSale ] = useState( INITIAL_STATE.is_on_sale );
	const [ youtubeVideo, setYoutubeVideo ] = useState( INITIAL_STATE.youtube_video );
	const [ featuredImageId, setFeaturedImageId ] = useState( INITIAL_STATE.featured_image_id );
	const [ featuredImageUrl, setFeaturedImageUrl ] = useState( INITIAL_STATE.featuredImageUrl );
	const [ selectedCats, setSelectedCats ] = useState<number[]>( INITIAL_STATE.categories );

	/* UI state */
	const [ loading, setLoading ] = useState( !! productId );
	const [ saving, setSaving ] = useState( false );

	const isEditing = !! productId;
	const allCategories = useCategories();

	/* ----------------------------------------------------------------
	 * Load existing product when editing
	 * -------------------------------------------------------------- */

	useEffect( () => {
		if ( ! productId ) return;

		setLoading( true );
		api.getProduct( productId )
			.then( ( product ) => {
				setTitle( product.title );
				setDescription( product.description );
				setPrice( product.price ? String( product.price ) : '' );
				setSalePrice( product.sale_price ? String( product.sale_price ) : '' );
				setIsOnSale( product.is_on_sale );
				setYoutubeVideo( product.youtube_video );
				setFeaturedImageId( product.featured_image_id );
				setFeaturedImageUrl( product.featured_image_url );
				setSelectedCats( product.categories );
			} )
			.catch( () => {
				setNotice( {
					status: 'error',
					message: __( 'Failed to load product.', 'hello-elementor-child' ),
				} );
			} )
			.finally( () => setLoading( false ) );
	}, [ productId, setNotice ] );

	/* ----------------------------------------------------------------
	 * Image callbacks
	 * -------------------------------------------------------------- */

	const handleImageSelect = useCallback( ( id: number, url: string ) => {
		setFeaturedImageId( id );
		setFeaturedImageUrl( url );
	}, [] );

	const handleImageRemove = useCallback( () => {
		setFeaturedImageId( 0 );
		setFeaturedImageUrl( '' );
	}, [] );

	/* ----------------------------------------------------------------
	 * Submit
	 * -------------------------------------------------------------- */

	const handleSubmit = useCallback( () => {
		if ( ! title.trim() ) {
			setNotice( {
				status: 'error',
				message: __( 'Title is required.', 'hello-elementor-child' ),
			} );
			return;
		}

		setSaving( true );

		const payload: ProductPayload = {
			title: title.trim(),
			description,
		price: price ? Number.parseFloat( price ) : 0,
		sale_price: salePrice ? Number.parseFloat( salePrice ) : 0,
			is_on_sale: isOnSale,
			youtube_video: youtubeVideo,
			featured_image_id: featuredImageId,
			categories: selectedCats,
		};

		const request = isEditing && productId
			? api.updateProduct( productId, payload )
			: api.createProduct( payload );

		request
			.then( () => {
				onSaved(
					isEditing
						? __( 'Product updated successfully.', 'hello-elementor-child' )
						: __( 'Product created successfully.', 'hello-elementor-child' ),
				);
			} )
			.catch( () => {
				setNotice( {
					status: 'error',
					message: __( 'Failed to save product.', 'hello-elementor-child' ),
				} );
			} )
			.finally( () => setSaving( false ) );
	}, [
		title, description, price, salePrice, isOnSale, youtubeVideo,
		featuredImageId, selectedCats, isEditing, productId, onSaved, setNotice,
	] );

	/* ----------------------------------------------------------------
	 * Render
	 * -------------------------------------------------------------- */

	if ( loading ) {
		return (
			<div className="jeec-loading">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			{ /* Header */ }
			<div className="jeec-header">
				<h1>
					{ isEditing
						? __( 'Edit Product', 'hello-elementor-child' )
						: __( 'Add New Product', 'hello-elementor-child' ) }
				</h1>
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( '← Back to Products', 'hello-elementor-child' ) }
				</Button>
			</div>

			<div className="jeec-product-form">
				<Panel>
					{ /* ---- Product Details ---- */ }
					<PanelBody
						title={ __( 'Product Details', 'hello-elementor-child' ) }
						initialOpen
					>
						<ImagePicker
							imageUrl={ featuredImageUrl }
							onSelect={ handleImageSelect }
							onRemove={ handleImageRemove }
						/>

						<TextControl
							label={ __( 'Title', 'hello-elementor-child' ) }
							value={ title }
							onChange={ setTitle }
							placeholder={ __( 'Product title', 'hello-elementor-child' ) }
							__nextHasNoMarginBottom
						/>

						<TextareaControl
							label={ __( 'Description', 'hello-elementor-child' ) }
							value={ description }
							onChange={ setDescription }
							rows={ 5 }
							placeholder={ __( 'Product description…', 'hello-elementor-child' ) }
						/>

						<div className="jeec-form-row">
							<TextControl
								label={ __( 'Price ($)', 'hello-elementor-child' ) }
								type="number"
								min={ 0 }
								step={ 0.01 }
								value={ price }
								onChange={ setPrice }
								placeholder="0.00"
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Sale Price ($)', 'hello-elementor-child' ) }
								type="number"
								min={ 0 }
								step={ 0.01 }
								value={ salePrice }
								onChange={ setSalePrice }
								placeholder="0.00"
								__nextHasNoMarginBottom
							/>
						</div>

						<ToggleControl
							label={ __( 'Is on Sale?', 'hello-elementor-child' ) }
							checked={ isOnSale }
							onChange={ setIsOnSale }
							__nextHasNoMarginBottom
						/>

						<TextControl
							label={ __( 'YouTube Video URL', 'hello-elementor-child' ) }
							type="url"
							value={ youtubeVideo }
							onChange={ setYoutubeVideo }
							placeholder="https://www.youtube.com/watch?v=..."
							__nextHasNoMarginBottom
						/>
					</PanelBody>

					{ /* ---- Category ---- */ }
					<PanelBody
						title={ __( 'Category', 'hello-elementor-child' ) }
						initialOpen
					>
						<CategorySelector
							categories={ allCategories }
							selected={ selectedCats }
							onChange={ setSelectedCats }
						/>
					</PanelBody>
				</Panel>

				{ /* ---- Actions ---- */ }
				<div className="jeec-form-actions">
					<Button
						variant="primary"
						isBusy={ saving }
						disabled={ saving }
						onClick={ handleSubmit }
					>
						{ isEditing
							? __( 'Update Product', 'hello-elementor-child' )
							: __( 'Create Product', 'hello-elementor-child' ) }
					</Button>
					<Button variant="tertiary" onClick={ onCancel } disabled={ saving }>
						{ __( 'Cancel', 'hello-elementor-child' ) }
					</Button>
				</div>
			</div>
		</>
	);
}
