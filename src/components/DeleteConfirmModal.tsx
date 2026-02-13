/**
 * DeleteConfirmModal — asks the user to confirm product deletion.
 */

import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface DeleteConfirmModalProps {
	readonly isDeleting: boolean;
	readonly onConfirm: () => void;
	readonly onCancel: () => void;
}

export default function DeleteConfirmModal( {
	isDeleting,
	onConfirm,
	onCancel,
}: DeleteConfirmModalProps ) {
	return (
		<Modal
			title={ __( 'Delete Product', 'hello-elementor-child' ) }
			onRequestClose={ onCancel }
			size="small"
		>
			<div className="jeec-delete-confirm">
				<p>
					{ __(
						'Are you sure you want to permanently delete this product?',
						'hello-elementor-child',
					) }
				</p>
				<div className="jeec-delete-confirm__actions">
					<Button
						variant="tertiary"
						onClick={ onCancel }
						disabled={ isDeleting }
					>
						{ __( 'Cancel', 'hello-elementor-child' ) }
					</Button>
					<Button
						variant="primary"
						isDestructive
						isBusy={ isDeleting }
						onClick={ onConfirm }
					>
						{ __( 'Delete', 'hello-elementor-child' ) }
					</Button>
				</div>
			</div>
		</Modal>
	);
}
