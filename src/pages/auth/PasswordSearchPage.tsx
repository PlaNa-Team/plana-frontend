import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import OneTimePasswordField from '../../components/ui/OneTimePasswordField';
import { authAPI } from '../../services/api';
import { resetPasswordAsync } from '../../store/slices/authSlice';

interface PasswordSearchForm {
  email: string;
  newPassword?: string;
  confirmPassword?: string;
}

const PasswordSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<PasswordSearchForm>({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    emailError: '',
    passwordError: ''
  });

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '올바른 이메일 형식을 입력해주세요.';
    return '';
  };

  const validatePasswords = (pw: string, confirm: string): string => {
    if (!pw || !confirm) return '비밀번호를 모두 입력해주세요.';
    if (pw.length < 6) return '비밀번호는 6자리 이상이어야 합니다.';
    if (pw !== confirm) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  const sendVerificationEmail = async () => {
  const emailError = validateEmail(formData.email);
  if (emailError) {
    setErrors(prev => ({ ...prev, emailError }));
    return;
  }

  setIsEmailSent(true);

  try {
    const response = await authAPI.sendEmailVerification(formData.email, 'RESET_PASSWORD');
    console.log('이메일 인증 발송:', response.message);
    setIsModalOpen(true);
  } catch (error) {
    setIsEmailSent(false);
    setErrors(prev => ({ 
      ...prev, 
      emailError: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.' 
    }));
  }
};

  const verifyCode = async (code: string): Promise<boolean> => {
    try {
      const response = await authAPI.verifyEmailCode(formData.email, code);
      if (response.verified === true) {
        setIsVerified(true);
        setIsEmailVerified(true);
        setIsEmailSent(false);
        setIsModalOpen(false);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      setIsEmailVerified(false);
      console.error('인증 실패:', error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.');
      return false;
    }
  };

  const handlePasswordReset = async () => {
    const passwordError = validatePasswords(formData.newPassword || '', formData.confirmPassword || '');
    if (passwordError) {
      setErrors(prev => ({ ...prev, passwordError }));
      return;
    }

    try {
      await dispatch(
        resetPasswordAsync({
          email: formData.email,
          newPassword: formData.newPassword!,
          confirmPassword: formData.confirmPassword!
        })
      ).unwrap();

      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/login');
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        passwordError: error?.message || '비밀번호 변경에 실패했습니다.'
      }));
    }
  };

  return (
        <div className="ps-page">
      <div className="logo-container">
        <h1 className="logo">PlaNa</h1>
      </div>

      <div className="ps-container">
        <h2 className="ps-title">비밀번호 찾기</h2>

        {/* 이메일 입력 (인증 완료 시 숨김) */}
        {!isVerified && (
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
              {errors.emailError && (
                <div className="error-message">{errors.emailError}</div>
              )}
              <button
                className="email-button"
                onClick={sendVerificationEmail}
                disabled={!formData.email || isEmailSent}
                title={isEmailSent ? '새로고침 하여 재입력 하세요' : ''}
              >
                {isEmailSent ? '인증코드 발송완료' : '인증코드 발송'}
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 입력 필드 (인증 성공 시만 표시) */}
        {isVerified && (
          <div className="form-group">
            <label className="input-label">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              placeholder="새 비밀번호를 입력하세요."
              value={formData.newPassword || ''}
              onChange={handleInputChange}
              className="form-input"
            />
            <label className="input-label">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요."
              value={formData.confirmPassword || ''}
              onChange={handleInputChange}
              className="form-input"
            />
            {errors.passwordError && (
              <div className="error-message">{errors.passwordError}</div>
            )}
          </div>
        )}

        {/* 비밀번호 변경 버튼 (인증 성공 시만 표시) */}
        {isVerified && (
          <div className="to-search">
            <button
              className="temp-password-button"
              onClick={handlePasswordReset}
              disabled={!formData.newPassword || !formData.confirmPassword}
            >
              비밀번호 변경
            </button>
          </div>
        )}

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
}

export default PasswordSearchPage;
