import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


interface PasswordSearchForm {
  email: string;
  verificationCode: string;
}

const PasswordSearchPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState<PasswordSearchForm>({
    email: '',
    verificationCode: ''
  });

  // 유효성 검사 상태
  const [errors, setErrors] = useState({
    emailError: '',
    verificationError: ''
  });

  // UI 상태
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState(180); // 3분

  // 임시 핸들러들 (나중에 구현)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = () => {
    // 이메일 유효성 검사 로직 (나중에 구현)
    console.log('이메일 유효성 검사');
  };

  const sendVerificationEmail = () => {
    // 이메일 인증 발송 로직 (나중에 구현)
    console.log('인증코드 발송');
  };

  const verifyCode = () => {
    // 인증 코드 확인 로직 (나중에 구현)
    console.log('인증코드 확인');
  };

  const sendTempPassword = () => {
    // 임시 비밀번호 발송 로직 (나중에 구현)
    console.log('임시 비밀번호 발송');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="ps-page">
      <div className="logo-container">
        <h1 className="logo">
          Plana
        </h1>
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
          >
            {isEmailSent ? '인증코드 발송완료' : '인증코드 발송'}
          </button>
        </div>

        {/* 인증코드 확인 */}
        <div className="form-group">
          <label className="input-label">인증코드 확인*</label>
          <div className="input-with-button">
            <div className={`input-wrapper-with-timer ${isVerified ? 'success' : ''}`}>
              <input
                type="text"
                name="verificationCode"
                placeholder="인증코드를 입력하세요."
                value={formData.verificationCode}
                onChange={handleInputChange}
                className="form-input2"
                disabled={!isEmailSent || isVerified || !isTimerRunning}
              />
              {isTimerRunning && !isVerified && (
                <span className="timer">{formatTime(timer)}</span>
              )}
            </div>
            <button 
              className={`verify-button ${formData.verificationCode && !isVerified ? 'active' : ''}`}
              disabled={!formData.verificationCode || isVerified || !isTimerRunning}
              onClick={verifyCode}
            >
              {isVerified ? '완료' : '인증'}
            </button>
          </div>
          {errors.verificationError && <div className="error-message">{errors.verificationError}</div>}
          {isVerified && <div className="success-message">인증이 완료되었습니다!</div>}
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
    </div>
  );
};

export default PasswordSearchPage;