import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OneTimePasswordField from '../../components/ui/OneTimePasswordField';

interface PasswordSearchForm {
  email: string;
}

const PasswordSearchPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState<PasswordSearchForm>({
    email: ''
  });

  // 유효성 검사 상태
  const [errors, setErrors] = useState({
    emailError: ''
  });

  // UI 상태
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendVerificationEmail = () => {
    console.log('인증코드 발송');
    setIsEmailSent(true);
    setIsModalOpen(true);
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    console.log('인증코드 확인:', code);
    
    // 임시로 '123456'만 올바른 코드로 처리
    if (code === '123456') {
      setIsVerified(true);
      setIsModalOpen(false);
      return true;
    } else {
      console.log('잘못된 인증번호');
      return false;
    }
  };

  const sendTempPassword = () => {
    console.log('임시 비밀번호 발송');
  };

  return (
    <div className="ps-page">
      <div className="logo-container">
        <h1 className="logo">Plana</h1>
      </div>
      
      <div className="ps-container">
        <h2 className="ps-title">비밀번호 찾기</h2>
        
        {/* 이메일 입력 */}
        <div className="form-group">
          <label className="input-label">이메일*</label>
          <div className={`input-wrapper ${errors.emailError ? 'error' : ''}`}>
            <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" 
                fill="currentColor"
              />
            </svg>
            <input
              type="email"
              name="email"
              placeholder="이메일을 입력하세요."
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          {errors.emailError && <div className="error-message">{errors.emailError}</div>}
          <button 
            className="email-button"
            onClick={sendVerificationEmail}
            disabled={!formData.email || isEmailSent}
            title={isEmailSent ? "새로고침 하여 재 입력하시오" : ""}
          >
            {isEmailSent ? '인증코드 발송완료' : '인증코드 발송'}
          </button>
        </div>

        {/* 비밀번호 찾기 버튼 */}
        <div className="to-search">
          <button 
            className="temp-password-button"
            onClick={sendTempPassword}
            disabled={!isVerified}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 로그인으로 돌아가기 */}
        <div className="back-to-login">
          <Link to="/login" className="back-link">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 인증코드 입력 모달 */}
      <OneTimePasswordField 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={verifyCode}
      />
    </div>
  );
};

export default PasswordSearchPage;