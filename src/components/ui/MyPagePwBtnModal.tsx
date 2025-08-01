import React, { useState } from "react";
import { XIcon } from "../../assets/icons";

interface MyPagePwBtnModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const MyPagePwBtnModal: React.FC<MyPagePwBtnModalProps> = ({
    isOpen = false,
    onClose,
}) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [showError, setShowError] = useState(false);

    // 현재 비밀번호 확인 함수
    const handlePasswordVerification = () => {
        // TODO: 실제 API 호출로 비밀번호 확인
        // 임시로 '1234'가 올바른 비밀번호라고 가정
        if (currentPassword === "1234") {
            setIsPasswordVerified(true);
            setShowError(false);
        } else {
            setShowError(true);
            setIsPasswordVerified(false);
        }
    };

    // 비밀번호 변경 함수
    const handlePasswordUpdate = () => {
        // TODO: 실제 API 호출로 비밀번호 변경
        console.log("새 비밀번호:", newPassword);
        
        // 모달 닫기 및 상태 초기화
        if (onClose) {
            onClose();
        }
        resetModal();
    };

    // 모달 상태 초기화
    const resetModal = () => {
        setCurrentPassword("");
        setNewPassword("");
        setIsPasswordVerified(false);
        setShowError(false);
    };

    // 모달 닫기 시 상태 초기화
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        resetModal();
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
                                    />
                                </div>
                                {/* 비밀번호가 틀린 경우 토스트 메시지 */}
                                {showError && (
                                    <div className="mypagebtn-modal__inputbox-tostmsg-box-false">
                                        비밀번호가 일치하지 않습니다.
                                    </div>
                                )}
                            </div>
                            <button 
                                className="mypagebtn-modal__checkbtn"
                                onClick={handlePasswordVerification}
                            >
                                확인
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
                                    />
                                </div>
                            </div>
                            <button 
                                className="mypagebtn-modal__update-btn" 
                                onClick={handlePasswordUpdate}
                            >
                                변경
                            </button>
                        </>
                    )}
                </div>    
            </div>
        </div>
    );
};

export default MyPagePwBtnModal;