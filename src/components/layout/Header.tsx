import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Header() {
    const location = useLocation();

    // 현재 경로를 기준으로 모드 결정
    const getCurrentMode = () => {
        const path = location.pathname;
        if (path.includes('/diary')) return 'Diary';
        if (path.includes('/project')) return 'Project Journal';
        return 'Calendar';
    };

    const currentMode = getCurrentMode();

  return (
    <div>
        <div>
            <div>우감자의</div>
            <div>{ getCurrentMode() }</div>
        </div>
    </div>
  )
}
