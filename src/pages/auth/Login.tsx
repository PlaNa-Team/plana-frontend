import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [emailError, setEmailError] = useState<string>('');
  const [loginFailed, setLoginFailed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    setEmailError('');
    return true;
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 이메일 실시간 유효성 검사
    if (name === 'email') {
      validateEmail(value);
    }

    // 로그인 실패 메시지 초기화
    if (loginFailed) {
      setLoginFailed(false);
    }
  };

  // 로그인 핸들러
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email) || !formData.password) {
      return;
    }

    setIsLoading(true);
    setLoginFailed(false);

    try {
      // TODO: 실제 로그인 API 호출
      const response = await loginAPI(formData.email, formData.password);
      
      if (response.success) {
        // 로그인 성공 시 Calendar로 이동
        navigate('/calendar');
      } else {
        setLoginFailed(true);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      setLoginFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 로그인 API 함수 (실제 구현 시 대체)
  const loginAPI = async (email: string, password: string) => {
    // 임시 구현 - 실제로는 백엔드 API 호출
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: email === 'test@plana.com' && password === 'password' });
      }, 1000);
    });
  };

  // 폼 유효성 검사
  const isFormValid = !emailError && formData.email && formData.password;

  return (
    <div className="login-container">
      <div className="login-header">
        <h2 className="title">
          일정 관리를 더 쉽고, 빠르고, 정확하게!
        </h2>
        <p className="subtitle">
          PlaNa
        </p>
      </div>

      <div className="login-box">
        <form className="login-form" onSubmit={handleLogin}>
          <h3 className="form-title">로그인</h3>
          
          <div className="form-group">
            <div className={`input-wrapper ${emailError ? 'error' : ''}`}>
              <span className="input-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" 
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요."
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                autoComplete="email"
              />
            </div>
            {emailError && <div className="error-message">{emailError}</div>}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" 
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력해 주세요."
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                autoComplete="current-password"
              />
            </div>
            {loginFailed && (
              <div className="error-message">
                이메일 또는 비밀번호가 일치하지 않습니다.
              </div>
            )}
          </div>

          <div className="login-options">
            <Link to="/passwordsearch" className="find-account">
              비밀번호 찾기
            </Link>
          </div>

          <button 
            type="submit"
            className="login-button" 
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인하기'}
          </button>

          <div className="signup-section">
            <Link to="/signup" className="signup-link">
              계정 만들기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;