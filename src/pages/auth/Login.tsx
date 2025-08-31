import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAppDispatch } from '../../store';
import { loginSuccess, setError, clearError } from '../../store/slices/authSlice';
import { User, Provider } from '../../types/user.types';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [emailError, setEmailError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      validateEmail(value);
    }

    if (loginError) {
      setLoginError('');
      dispatch(clearError());
    }
  };

  const handleLogin = async () => {
    if (!validateEmail(formData.email) || !formData.password) {
      return;
    }

    setIsLoading(true);
    setLoginError('');
    dispatch(clearError());

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      // 백엔드 LoginResponseDto 구조에 맞춰 처리
      if (response.accessToken && response.member) {
        // 🔑 로그인 성공 시 콘솔 로그 추가
        console.log('✅ 로그인 성공!');
        console.log('Access Token:', response.accessToken);
//         console.log('Refresh Token:', response.refreshToken);
        console.log('토큰 만료 시간(Expires In):', response.expiresIn, '밀리초');
        console.log('사용자 정보:', response.member);


        const fullUser: User = {
          id: response.member.id,
          name: response.member.name,
          loginId: response.member.email,
          email: response.member.email,
          password: '',
          nickname: response.member.nickname || response.member.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          provider: 'LOCAL' as Provider,
//        refreshToken: response.refreshToken <-- 쿠키로 담기 떄문에 필요 없음
        };
        
        dispatch(loginSuccess({
          accessToken: response.accessToken,
//        refreshToken: response.refreshToken, <-- 쿠키로 담기 떄문에 필요 없음
          user: fullUser
        }));
        
//         localStorage.setItem('refreshToken', response.refreshToken); <-- 쿠키로 담기 떄문에 필요 없음

        navigate('/calendar');
      } else {
        throw new Error('서버에서 올바른 응답을 받지 못했습니다.');
      }

    } catch (error: any) {
      // ❌ 로그인 실패 시 콘솔 로그
      console.error('❌ 로그인 실패:', error);
      let errorMessage = '로그인에 실패했습니다.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      dispatch(setError(errorMessage));
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    const baseUrl = 'http://localhost:8080';
    window.location.href = `${baseUrl}/oauth2/authorization/${provider}`;
  };

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
        <div className="login-form">
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
            <div className={`input-wrapper ${loginError ? 'error' : ''}`}>
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
            {loginError && <div className="error-message">{loginError}</div>}
          </div>

          <div className="login-options">
            <Link to="/passwordsearch" className="find-account">
              비밀번호 찾기
            </Link>
          </div>

          <button 
            type="button"
            onClick={handleLogin}
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
        </div>
        
        <div className="social-login-section">
          <div className="divider">
            <div className='divider-line1'></div>
            <span className="divider-text">SNS 간편로그인</span>
            <div className='divider-line1'></div>
          </div>
          
          <div className="social-buttons">
            <button 
              type="button"
              className="social-button kakao"
              onClick={() => handleSocialLogin('kakao')}
              aria-label="카카오로 로그인"
            >
              <div className="social-icon">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 25C50 38.807 38.8097 50 25.0059 50C11.1903 50.0119 0 38.807 0 25C0 11.193 11.1903 0 24.9941 0C38.7978 0 49.9881 11.193 49.9881 25H50Z" fill="#F5E02E"/>
                  <path d="M25 14C17.8178 14 12 18.593 12 24.2517C12 27.9141 14.4291 31.1262 18.0877 32.9424C17.8927 33.6328 16.8131 37.3703 16.7682 37.6555C16.7682 37.6555 16.7382 37.8806 16.8881 37.9557C17.0381 38.0457 17.203 37.9707 17.203 37.9707C17.6078 37.9106 21.9412 34.8637 22.6909 34.3383C23.4406 34.4434 24.2053 34.5034 25 34.5034C32.1822 34.5034 38 29.9104 38 24.2517C38 18.593 32.1822 14 25 14Z" fill="#040000"/>
                  <path d="M17.9276 27.7493C17.51 27.7493 17.182 27.4361 17.182 27.0335V22.6045H16.0188C15.6162 22.6045 15.2881 22.2764 15.2881 21.8738C15.2881 21.4711 15.6162 21.1431 16.0188 21.1431H19.8364C20.239 21.1431 20.5671 21.4711 20.5671 21.8738C20.5671 22.2764 20.239 22.6045 19.8364 22.6045H18.6732V27.0335C18.6732 27.4212 18.3451 27.7493 17.9276 27.7493Z" fill="#F5E02E"/>
                  <path d="M24.4744 27.749C24.1612 27.749 23.9226 27.6297 23.8481 27.4209L23.4753 26.4516H21.2086L20.8358 27.4209C20.7612 27.6297 20.5226 27.749 20.2094 27.749C20.0454 27.749 19.8814 27.7192 19.7322 27.6446C19.5235 27.5551 19.3296 27.2867 19.5533 26.5858L21.3428 21.8884C21.4621 21.5305 21.8498 21.1577 22.3419 21.1577C22.834 21.1577 23.2068 21.5305 23.341 21.8884L25.1305 26.5858C25.3542 27.2867 25.1604 27.5551 24.9516 27.6446C24.8025 27.7192 24.6384 27.749 24.4744 27.749ZM23.0875 25.1244L22.3419 23.0069L21.5963 25.1244H23.0875Z" fill="#F5E02E"/>
                  <path d="M26.3237 27.6449C25.936 27.6449 25.6079 27.3317 25.6079 26.9589V21.8887C25.6079 21.4711 25.9509 21.1431 26.3684 21.1431C26.786 21.1431 27.129 21.4711 27.129 21.8887V26.2729H28.7097C29.0974 26.2729 29.4255 26.5861 29.4255 26.9589C29.4255 27.3317 29.1123 27.6449 28.7097 27.6449H26.3237Z" fill="#F5E02E"/>
                  <path d="M30.4693 27.749C30.0517 27.749 29.7236 27.4209 29.7236 27.0034V21.9033C29.7236 21.4858 30.0517 21.1577 30.4693 21.1577C30.8868 21.1577 31.2149 21.4858 31.2149 21.9033V23.499L33.3026 21.4112C33.407 21.3068 33.5561 21.2472 33.7202 21.2472C33.8991 21.2472 34.093 21.3218 34.2272 21.4709C34.3614 21.6051 34.436 21.7691 34.4509 21.9481C34.4509 22.127 34.4061 22.2911 34.2868 22.3954L32.5868 24.0955L34.421 26.5262C34.5403 26.6902 34.5851 26.8841 34.5702 27.0779C34.5403 27.2718 34.436 27.4508 34.2868 27.5701C34.1526 27.6744 34.0035 27.7192 33.8395 27.7192C33.6009 27.7192 33.3921 27.6148 33.243 27.4209L31.4982 25.1095L31.2447 25.363V26.9885C31.2447 27.406 30.9166 27.7341 30.4991 27.7341L30.4693 27.749Z" fill="#F5E02E"/>
                </svg>
              </div>
            </button>

            <button 
              type="button"
              className="social-button naver"
              onClick={() => handleSocialLogin('naver')}
              aria-label="네이버로 로그인"
            >
              <div className="social-icon">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 25C50 11.1929 38.8071 0 25 0C11.1929 0 0 11.1929 0 25C0 38.8071 11.1929 50 25 50C38.8071 50 50 38.8071 50 25Z" fill="#03C75A"/>
                  <path d="M28.2076 25.6395L21.5339 16H16V34H21.7924V24.3605L28.4661 34H34V16H28.2076V25.6395Z" fill="white"/>
                </svg>
              </div>
            </button>

            <button 
              type="button"
              className="social-button google"
              onClick={() => handleSocialLogin('google')}
              aria-label="구글로 로그인"
            >
              <div className="social-icon">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M51 26C51 12.1929 39.8071 1 26 1C12.1929 1 1 12.1929 1 26C1 39.8071 12.1929 51 26 51C39.8071 51 51 39.8071 51 26Z" fill="white" stroke="#CDCDCD" strokeMiterlimit="10"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M16.1982 21.0702C16.6562 20.0873 17.2999 19.2257 18.0673 18.437C19.7878 16.6774 21.8673 15.5489 24.3181 15.1606C27.7592 14.6266 30.8413 15.4154 33.5025 17.6603C33.6758 17.806 33.7129 17.8909 33.5273 18.0608C32.5866 18.9588 31.6582 19.881 30.7299 20.7911C30.6308 20.8882 30.569 20.9974 30.3957 20.8518C28.0562 18.7403 24.2191 18.7646 21.7312 21.046C20.8771 21.8226 20.2706 22.757 19.8745 23.837C19.8126 23.8006 19.7507 23.7642 19.7012 23.7278C18.5253 22.8419 17.3618 21.9682 16.1982 21.0824V21.0702Z" fill="#CB2B2B"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.8624 28.1208C20.1966 28.9582 20.6175 29.7469 21.2364 30.4265C22.8083 32.1375 24.7764 32.8777 27.1158 32.635C28.2051 32.5258 29.1953 32.1618 30.1237 31.6036C30.2103 31.6764 30.297 31.7613 30.396 31.8341C31.4852 32.6593 32.5621 33.4966 33.6514 34.3218C32.4507 35.4382 31.0396 36.1784 29.4553 36.5788C25.7048 37.5132 22.2513 36.9186 19.1816 34.5402C17.9067 33.5573 16.9165 32.3438 16.2109 30.9119C17.4363 29.9775 18.6494 29.0552 19.8748 28.1208H19.8624Z" fill="#48A544"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M33.6393 34.3217C32.55 33.4965 31.4608 32.6592 30.3839 31.834C30.2849 31.7612 30.2106 31.6763 30.1116 31.6035C30.8419 31.0574 31.4608 30.4021 31.8693 29.577C32.0302 29.2493 32.1416 28.8974 32.253 28.5576C32.3272 28.3149 32.3025 28.2179 32.0054 28.23C30.1983 28.2421 28.3911 28.23 26.5839 28.23C26.3281 28.23 26.2002 28.1005 26.2002 27.8417C26.2002 26.6403 26.2002 25.439 26.2002 24.2376C26.2002 24.0071 26.2373 23.9221 26.5096 23.9221C29.8393 23.9221 33.1813 23.9221 36.511 23.9221C36.6966 23.9221 36.808 23.9343 36.8328 24.1527C37.2536 27.0165 36.9194 29.7468 35.3846 32.2709C34.9142 33.0475 34.3572 33.7513 33.6517 34.3338L33.6393 34.3217Z" fill="#5979B3"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.8625 28.1206C18.6371 29.055 17.4241 29.9772 16.1986 30.9116C15.6045 29.8195 15.2579 28.6545 15.097 27.441C14.8247 25.3296 15.1218 23.3031 16.0377 21.3736C16.0872 21.2644 16.1491 21.1673 16.211 21.0581C17.3745 21.9439 18.5504 22.8298 19.714 23.7035C19.7635 23.7399 19.8254 23.7763 19.8872 23.8127C19.3921 25.2446 19.4169 26.6765 19.8625 28.1084V28.1206Z" fill="#EABD1B"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;