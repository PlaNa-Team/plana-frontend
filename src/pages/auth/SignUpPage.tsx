import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


interface SignUpForm {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  name: string;
  gender: '남성' | '여성' | '';
  affiliation: string;
  privacyChecked: boolean;
  termsChecked: boolean;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 폼 데이터 상태 (기능 구현은 나중에)
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '',
    affiliation: '',
    privacyChecked: false,
    termsChecked: false
  });

  // 유효성 검사 상태
  const [errors, setErrors] = useState({
    emailError: '',
    verificationError: '',
    passwordError: '',
    confirmPasswordError: '',
    nameError: ''
  });

  // UI 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState(180); // 3분

  // 임시 핸들러들 (나중에 구현)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectGender = (gender: '남성' | '여성') => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
  };

  const sendVerificationEmail = () => {
    // 이메일 인증 발송 로직 (나중에 구현)
    console.log('이메일 인증 발송');
  };

  const verifyCode = () => {
    // 인증 코드 확인 로직 (나중에 구현)
    console.log('인증 코드 확인');
  };

  const submitForm = () => {
    // 회원가입 제출 로직 (나중에 구현)
    console.log('회원가입 제출', formData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="signup-page">
      <div className="logo-container">
        <h1 className="logo">
          Plana
        </h1>
      </div>
      
      <div className="signup-container">
        <h2 className="signup-title">계정 만들기</h2>
        
        <div className="form-section">
          <h3 className="section-title">개인정보 입력</h3>
          {/* 이메일 입력 */}
          <div className="form-group">
            <label className="input-label">이메일*</label>
            <div className={`input-wrapper ${errors.emailError ? 'error' : ''} ${!errors.emailError && formData.email ? 'success' : ''}`}>
              <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
              </svg>
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요."
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                disabled={isEmailSent}
              />
            </div>
            {errors.emailError && <div className="error-message">{errors.emailError}</div>}
            <button 
              className="button email-button" 
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
                className={`button verify-button ${formData.verificationCode && !isVerified ? 'active' : ''}`}
                disabled={!formData.verificationCode || isVerified || !isTimerRunning}
                onClick={verifyCode}
              >
                {isVerified ? '완료' : '인증'}
              </button>
            </div>
            {errors.verificationError && <div className="error-message">{errors.verificationError}</div>}
            {isVerified && <div className="success-message">인증이 완료되었습니다!</div>}
          </div>
          
          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label className="input-label">비밀번호 입력*</label>
            <div className={`input-wrapper ${errors.passwordError ? 'error' : ''} ${!errors.passwordError && formData.password && formData.confirmPassword ? 'success' : ''}`}>
              <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="비밀번호를 입력해 주세요."
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
              />
              <svg 
                className="eye-icon" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                ) : (
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                )}
              </svg>
            </div>
            {errors.passwordError && <div className="error-message">{errors.passwordError}</div>}
            <p className="password-hint">8자리 이상, 영문+숫자+특수문자(!@#$%^&*)조합</p>
          </div>
          
          {/* 비밀번호 확인 */}
          <div className="form-group">
            <div className={`input-wrapper ${errors.confirmPasswordError ? 'error' : ''} ${!errors.confirmPasswordError && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}>
              <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="비밀번호를 한 번 더 입력해 주세요."
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
              />
              <svg 
                className="eye-icon" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                ) : (
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                )}
              </svg>
            </div>
            {errors.confirmPasswordError && <div className="error-message">{errors.confirmPasswordError}</div>}
            {!errors.confirmPasswordError && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="success-message">비밀번호가 일치합니다!</div>
            )}
          </div>
        </div>

        {/* 필수정보 입력 */}
        <div className="form-section">
          <h3 className="section-title">필수정보 입력</h3>
          
          <div className="form-group">
            <label className="input-label">이름*</label>
            <div className={`input-wrapper ${errors.nameError ? 'error' : ''}`}>
              <input
                type="text"
                name="name"
                placeholder="이름을 입력해 주세요."
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            {errors.nameError && <div className="error-message">{errors.nameError}</div>}
          </div>
        </div>
        
        {/* 추가정보 입력 */}
        <div className="form-section">
          <h3 className="section-title">추가정보 입력</h3>
          
          <div className="form-group">
            <label className="input-label">성별</label>
            <div className="gender-buttons">
              <button 
                type="button"
                className={`button gender-button ${formData.gender === '남성' ? 'active' : ''}`}
                onClick={() => selectGender('남성')}
              >
                남성
              </button>
              <button 
                type="button"
                className={`button gender-button ${formData.gender === '여성' ? 'active' : ''}`}
                onClick={() => selectGender('여성')}
              >
                여성
              </button>
            </div>
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className="form-section">
            <button 
                className="complete-button"
                onClick={submitForm}
                disabled={!formData.privacyChecked || !formData.termsChecked}
            >
            완료
        </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;