import * as React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface CustomAlertDialogProps {
	title: string;
	description: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	confirmText?: string;
	cancelText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
	title,
	description,
	isOpen,
	onOpenChange,
	confirmText = "확인",
	cancelText = "취소",
	onConfirm,
	onCancel
}) => {
	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		}
		onOpenChange(false);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
		onOpenChange(false);
	};

	return (
		<AlertDialog.Root 
			open={ isOpen }
			onOpenChange={ onOpenChange }
		>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className="AlertDialogOverlay" />
				<AlertDialog.Content className="AlertDialogContent">
					<AlertDialog.Title className="AlertDialogTitle">
						{ title }
					</AlertDialog.Title>
					<AlertDialog.Description className="AlertDialogDescription">
						{ description }
					</AlertDialog.Description>
					<div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
						<AlertDialog.Cancel asChild>
							<button className="Button mauve" onClick={ handleCancel }>
								{ cancelText }
							</button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild>
							<button className="Button red" onClick={ handleConfirm }>
								{ confirmText }
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
};

export default CustomAlertDialog;