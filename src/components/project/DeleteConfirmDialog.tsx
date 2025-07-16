import * as React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface DeleteConfirmDialogProps {
    onDelete: () => void; // 실제 삭제 함수
    children: React.ReactNode; // 삭제 버튼 (trigger)
    title?: string;
    description?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    onDelete,
    children,
    title = "정말로 삭제하시겠습니까?",
    description = "이 작업은 되돌릴 수 없습니다."
  }) => (
	<AlertDialog.Root>
		<AlertDialog.Trigger asChild>
			{ children }
		</AlertDialog.Trigger>
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
						<button className="Button">취소</button>
					</AlertDialog.Cancel>
					<AlertDialog.Action asChild>
						<button className="Button red" onClick={ onDelete }>삭제</button>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
);

export default DeleteConfirmDialog;