import React from "react";
// Radix UI Switch 가져오기
import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitchProps {
    checked?: boolean;        // 스위치 상태 (켜짐/꺼짐)
    onCheckedChange?: (checked: boolean) => void; // 상태 변경 시 실행할 함수
    disabled?: boolean;       // 비활성화 여부
    className?: string;       // 추가 CSS 클래스
}

export const Switch: React.FC<SwitchProps> = ({
    checked = false,          // 기본값: 꺼진 상태
    onCheckedChange,          // 상태 변경 핸들러
    disabled = false,         // 기본값: 활성화
    className = '',          // 기본값: 빈 문자열
    ...props                 // 나머지 props들
  }) => {
    return (
      // Radix UI Switch Root 컴포넌트
      <SwitchPrimitive.Root
        checked={checked}                           // 현재 상태
        onCheckedChange={onCheckedChange}          // 상태 변경 함수
        disabled={disabled}                        // 비활성화 여부
        className={`switch switch--${className}`} // CSS 클래스
        {...props}                                 // 추가 props 전달
      >
        {/* Switch의 움직이는 thumb 부분 */}
        <SwitchPrimitive.Thumb className="switch__thumb" />
      </SwitchPrimitive.Root>
    );
  };