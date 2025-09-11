import React, { useState, useEffect } from "react";
import { XIcon } from "../../assets/icons";
import { useDispatch, useSelector } from "react-redux";
import {
    passwordConfirmAsync,
    passwordUpdateAsync,
    resetPasswordState,
} from "../../store/slices/authSlice";
import { RootState } from "../../store"; // RootState 타입을 import

interface MyPagePwBtnModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const MyPagePwBtnModal: React.FC<MyPagePwBtnModalProps> = ({
    isOpen = false,
    onClose,
}) => {
    // Redux 상태 연동
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [message, setMessage] = useState("");

    // 모달이 열릴 때마다 상태 초기화
    useEffect(() => {
        if (isOpen) {
            resetModal();
        }
    }, [isOpen]);

    const resetModal = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsPasswordVerified(false);
        setMessage("");
        dispatch(resetPasswordState());
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        resetModal();
    };
    
    // 현재 비밀번호 확인 함수
    const handlePasswordVerification = async () => {
        if (!currentPassword) {
            setMessage("현재 비밀번호를 입력해주세요.");
            return;
        }

        setMessage("");

        try {
            await dispatch(passwordConfirmAsync(currentPassword) as any).unwrap(); // ⚠️ 타입 오류 해결을 위해 'as any'를 추가했습니다.
            setIsPasswordVerified(true);
        } catch (err: any) {
            setMessage(err.message || '비밀번호가 일치하지 않습니다.');
        }
    };

    // 비밀번호 변경 함수
    const handlePasswordUpdate = async () => {
        setMessage("");

        if (!newPassword || !confirmNewPassword) {
            setMessage("새 비밀번호와 확인 비밀번호를 모두 입력해주세요.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (newPassword.length < 8) {
             setMessage("비밀번호는 8자 이상이어야 합니다.");
             return;
        }

        try {
            // ⚠️ 여기서 'confirmNewPassword'를 'confirmPassword'로 수정했습니다.
            await dispatch(passwordUpdateAsync({ newPassword, confirmPassword: confirmNewPassword }) as any).unwrap(); // ⚠️ 타입 오류 해결을 위해 'as any'를 추가했습니다.
            alert('비밀번호가 성공적으로 변경되었습니다.');
            handleClose();
        } catch (err: any) {
            setMessage(err.message || '비밀번호 변경에 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="mypagebtn-modal-overlay" onClick={handleClose}> 
            <div className="mypagebtn-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mypagebtn-modal__header">
                    <div className="mypagebtn-modal__title-section">
                        <button className="mypagebtn-modal__closebtn" onClick={handleClose}>
                            <XIcon fill="var(--color-xs)" />
                        </button>
                        <div className="mypagebtn-modal__title1">PlaNa</div>
                        <div className="mypagebtn-modal__title2">플래나와 함께 일상을 기록해봐요!</div>
                        <div className="mypagebtn-modal__title3">비밀번호 변경</div>
                    </div>

                    {/* 비밀번호 확인 단계 */}
                    {!isPasswordVerified && (
                        <>
                            <div className="mypagebtn-modal__inputbox">
                                <div className="mypagebtn-modal__inputbox-title">현재 비밀번호</div>
                                <div className="mypagebtn-modal__inputbox-insert">
                                    <input 
                                        type="password"
                                        placeholder="현재 비밀번호를 입력하세요"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                {/* 에러 메시지 표시 */}
                                {(message || error) && (
                                    <div className="mypagebtn-modal__inputbox-tostmsg-box-false">
                                        {message || error}
                                    </div>
                                )}
                            </div>
                            <button 
                                className="mypagebtn-modal__checkbtn"
                                onClick={handlePasswordVerification}
                                disabled={isLoading}
                            >
                                {isLoading ? "확인 중..." : "확인"}
                            </button>
                        </>
                    )}

                    {/* 비밀번호 변경 단계 */}
                    {isPasswordVerified && (
                        <>
                            <div className="mypagebtn-modal__password-update">
                                <div className="mypagebtn-modal__inputbox-title">변경할 비밀번호</div>
                                <div className="mypagebtn-modal__inputbox-insert">
                                    <input 
                                        type="password"
                                        placeholder="변경할 비밀번호를 입력하세요"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mypagebtn-modal__inputbox-title">변경할 비밀번호 확인</div>
                                <div className="mypagebtn-modal__inputbox-insert">
                                    <input 
                                        type="password"
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                {/* 에러 메시지 표시 */}
                                {(message || error) && (
                                    <div className="mypagebtn-modal__inputbox-tostmsg-box-false">
                                        {message || error}
                                    </div>
                                )}
                            </div>
                            <button 
                                className="mypagebtn-modal__update-btn" 
                                onClick={handlePasswordUpdate}
                                disabled={isLoading}
                            >
                                {isLoading ? "변경 중..." : "변경"}
                            </button>
                        </>
                    )}
                </div>    
            </div>
        </div>
    );
};

export default MyPagePwBtnModal;