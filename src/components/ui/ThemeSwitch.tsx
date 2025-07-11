import React from "react";
// Radix UI Switch 가져오기
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { MoonIcon, SunIcon } from "../../assets/icons";

interface ThemeSwitchProps {
    isDarkMode?: boolean;        // 스위치 상태 (켜짐/꺼짐)
    onThemeChange?: (isDarkMode: boolean) => void; // 테마 변경 핸들러
    disabled?: boolean;       // 비활성화 여부
    className?: string;       // 추가 CSS 클래스
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
    isDarkMode = false,       // 기본값: 꺼진 상태
    onThemeChange,            // 상태 변경 핸들러
    disabled = false,         // 기본값: 활성화
    className = '',           // 기본값: 빈 문자열
    ...props                  // 나머지 props들
  }) => {
    return (
      // Radix UI Switch Root 컴포넌트
      <SwitchPrimitive.Root
        checked={isDarkMode}                       // 현재 상태
        onCheckedChange={onThemeChange}            // 상태 변경 함수
        disabled={disabled}                        // 비활성화 여부
        className={`theme-switch ${className}`}    // CSS 클래스
        {...props}                                 // 추가 props 전달
      >
        <div className="theme-switch__icons">
          <SunIcon fill="var(--color-xs)" className="theme-switch__sun"/>
          <MoonIcon fill="var(--color-xs)" className="theme-switch__moon"/>
        </div>
        {/* Switch의 움직이는 thumb 부분 */}
        <SwitchPrimitive.Thumb className="theme-switch__thumb" />
      </SwitchPrimitive.Root>
    );
  };