import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OneTimePasswordField from '../../components/ui/OneTimePasswordField';

// JSON API 스펙에 맞춘 인터페이스 (기존 필드들도 유지)
interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  login_id: string;
  nickname: string;
  provider: string;
  privacyChecked: boolean;
  termsChecked: boolean;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 폼 데이터 상태 - 새 필드들 추가
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    login_id: '',
    nickname: '',
    provider: 'LOCAL',
    privacyChecked: false,
    termsChecked: false
  });

  // 유효성 검사 상태 - 새 필드들 추가
  const [errors, setErrors] = useState({
    emailError: '',
    passwordError: '',
    confirmPasswordError: '',
    nameError: '',
    loginIdError: '',
    nicknameError: ''
  });

  // UI 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 에러 메시지 초기화 (사용자가 입력을 시작하면)
    const errorKey = `${name}Error` as keyof typeof errors;
    if (name === 'login_id' && errors.loginIdError) {
      setErrors(prev => ({ ...prev, loginIdError: '' }));
    } else if (name === 'name' && errors.nameError) {
      setErrors(prev => ({ ...prev, nameError: '' }));
    } else if (name === 'nickname' && errors.nicknameError) {
      setErrors(prev => ({ ...prev, nicknameError: '' }));
    } else if (name === 'email' && errors.emailError) {
      setErrors(prev => ({ ...prev, emailError: '' }));
    } else if (name === 'password' && errors.passwordError) {
      setErrors(prev => ({ ...prev, passwordError: '' }));
    } else if (name === 'confirmPassword' && errors.confirmPasswordError) {
      setErrors(prev => ({ ...prev, confirmPasswordError: '' }));
    }
  };

  // 유효성 검사 함수들
  const validateLoginId = (loginId: string): string => {
    if (!loginId.trim()) return '아이디를 입력해주세요.';
    if (loginId.length < 4) return '아이디는 4자 이상이어야 합니다.';
    if (!/^[a-zA-Z0-9]+$/.test(loginId)) return '아이디는 영문과 숫자만 사용 가능합니다.';
    return '';
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return '이름을 입력해주세요.';
    if (name.length < 2) return '이름은 2자 이상이어야 합니다.';
    return '';
  };

  const validateNickname = (nickname: string): string => {
    if (!nickname.trim()) return '닉네임을 입력해주세요.';
    if (nickname.length < 2) return '닉네임은 2자 이상이어야 합니다.';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '올바른 이메일 형식을 입력해주세요.';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      return '영문+숫자+특수문자(!@#$%^&*) 조합이어야 합니다.';
    }
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) return '비밀번호 확인을 입력해주세요.';
    if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  // 전체 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors = {
      loginIdError: validateLoginId(formData.login_id),
      nameError: validateName(formData.name),
      nicknameError: validateNickname(formData.nickname),
      emailError: validateEmail(formData.email),
      passwordError: validatePassword(formData.password),
      confirmPasswordError: validateConfirmPassword(formData.password, formData.confirmPassword)
    };

    setErrors(newErrors);

    // 모든 에러가 없고, 이메일 인증이 완료되었는지 확인
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    return !hasErrors && isVerified;
  };

  // 인증 코드 확인
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

  // 이메일 인증 발송
  const sendVerificationEmail = () => {
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, emailError }));
      return;
    }

    console.log('이메일 인증 발송:', formData.email);
    setIsEmailSent(true);
    setIsModalOpen(true);
  };

  // 회원가입 제출
  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API에 보낼 데이터 (클라이언트 전용 필드 제외)
      const apiData = {
        name: formData.name,
        login_id: formData.login_id,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        provider: formData.provider
      };

      console.log('회원가입 데이터:', apiData);
      
      // TODO: 실제 API 호출
      // const response = await api.signUp(apiData);
      // console.log('회원가입 성공:', response);
      
      // 성공 시 로그인 페이지로 이동
      navigate('/login');
      
    } catch (error) {
      console.error('회원가입 실패:', error);
      // 에러 처리 로직
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div className="signup-page">
      <div className="logo-container">
        <h1 className="logo">PlaNa</h1>
      </div>
      
      <div className="signup-container">
        <h2 className="signup-title">계정 만들기</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <div className="form-group">
              <label className="input-label">아이디*</label>
              <div className={`input-wrapper ${errors.loginIdError ? 'error' : ''}`}>
                <input
                  type="text"
                  name="login_id"
                  placeholder="아이디를 입력해 주세요."
                  value={formData.login_id}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              {errors.loginIdError && <div className="error-message">{errors.loginIdError}</div>}
            </div>

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

          <div className="form-group">
            <label className="input-label">닉네임*</label>
            <div className={`input-wrapper ${errors.nicknameError ? 'error' : ''}`}>
              <input
                type="text"
                name="nickname"
                placeholder="닉네임을 입력해 주세요."
                value={formData.nickname}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            {errors.nicknameError && <div className="error-message">{errors.nicknameError}</div>}
          </div>

        </div>

        <div className="form-section">
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
            
            <button 
              className="button email-button" 
              onClick={sendVerificationEmail}
              disabled={!formData.email || isEmailSent}
              title={isEmailSent ? "새로고침 하여 재 입력하시오" : ""}
            >
              {isEmailSent ? '인증코드 발송완료' : '인증코드 발송'}
            </button>
            </div>
            {errors.emailError && <div className="error-message">{errors.emailError}</div>}
          </div>

          {/* 인증코드 확인 */}
          <OneTimePasswordField 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onVerify={verifyCode}
          />

          <div className="form-group">
            <label className="input-label">비밀번호*</label>
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
          </div>
          
          <div className="form-group">
            <label className="input-label">비밀번호 재입력*</label>
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
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.20zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                )}
              </svg>
            </div>
            {errors.confirmPasswordError && <div className="error-message">{errors.confirmPasswordError}</div>}
            {!errors.confirmPasswordError && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="success-message">비밀번호가 일치합니다!</div>
            )}
          </div>
        </div>

        <div className="form-section">
          <button 
            type="submit"
            className="complete-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리중...' : '제출'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;