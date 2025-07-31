import * as React from "react";
import * as OTP from "@radix-ui/react-one-time-password-field";

interface OneTimePasswordFieldProps {
  isOpen?: boolean;
  onClose?: () => void;
  onVerify?: (code: string) => void;
}

const OneTimePasswordField: React.FC<OneTimePasswordFieldProps> = ({ 
  isOpen = false, 
  onClose, 
  onVerify 
}) => {
  const [value, setValue] = React.useState('');
  const [isError, setIsError] = React.useState(false);

  const handleComplete = async (code: string) => {
    if (code.length === 6 && onVerify) {
      await onVerify(code);
      // 인증 실패 시 에러 상태 설정 (PasswordSearchPage에서 처리)
      if (code !== '123456') {
        setIsError(true);
        setValue(''); // 입력값 초기화
      }
    }
  };

  const handleValueChange = (val: string) => {
    setValue(val);
    setIsError(false); // 새로 입력 시작하면 에러 상태 해제
    
    if (val.length === 6) {
      handleComplete(val);
    }
  };

  // 임시로 인증번호 검증 (실제로는 서버에서 처리)
  const mockVerification = (code: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === '123456') { // 올바른 인증번호
          resolve(true);
        } else { // 틀린 인증번호
          reject(new Error('잘못된 인증번호'));
        }
      }, 500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-otp" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <OTP.Root 
            className={`OTPRoot ${isError ? 'error' : ''}`}
            value={value}
            onValueChange={handleValueChange}
          >
            <OTP.Input className={`OTPInput ${isError ? 'error' : ''}`} index={0} />
            <OTP.Input className={`OTPInput ${isError ? 'error' : ''}`} index={1} />
            <OTP.Input className={`OTPInput ${isError ? 'error' : ''}`} index={2} />
            <OTP.Input className={`OTPInput ${isError ? 'error' : ''}`} index={3} />
            <OTP.Input className={`OTPInput ${isError ? 'error' : ''}`} index={4} />
            <OTP.Input className={`OTPInput ${isError ? 'error' : ''}`} index={5} />
          </OTP.Root>
          {isError && (
            <p className="error-text">잘못된 인증번호입니다. 다시 입력해주세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneTimePasswordField;