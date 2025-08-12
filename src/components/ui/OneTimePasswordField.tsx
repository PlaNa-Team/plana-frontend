import * as React from "react";
import * as OTP from "@radix-ui/react-one-time-password-field";

interface OneTimePasswordFieldProps {
  isOpen?: boolean;
  onClose?: () => void;
  onVerify?: (code: string) => Promise<boolean>;
}

const OneTimePasswordField: React.FC<OneTimePasswordFieldProps> = ({ 
  isOpen = false, 
  onClose, 
  onVerify 
}) => {
  const [value, setValue] = React.useState('');
  const [isError, setIsError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleComplete = async (code: string) => {
    if (code.length === 6 && onVerify) {
      setIsLoading(true);
      setIsError(false);
      
      try {
        const isSuccess = await onVerify(code);
        
        if (isSuccess) {
          setValue('');
          setIsError(false);
          if (onClose) onClose();
        } else {
          setIsError(true);
          setValue('');
        }
      } catch (error) {
        setIsError(true);
        setValue('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleValueChange = (val: string) => {
    setValue(val);
    setIsError(false);
    
    if (val.length === 6) {
      handleComplete(val);
    }
  };

  // 모달 열릴 때마다 상태 초기화
  React.useEffect(() => {
    if (isOpen) {
      setValue('');
      setIsError(false);
      setIsLoading(false);
    }
  }, [isOpen]);

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