import React , { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BellIcon, PersonIcon } from '../../assets/icons';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { toggleTheme } from '../../store/slices/themeSlice';
import { RootState } from '../../store';
import MyPageModal from '../ui/MyPageModal';

function Header() {
    const location = useLocation();
    const dispatch = useDispatch();
    const [isMyPageModalOpen, setIsMyPageModalOpen] = useState(false);

    // Redux store에서 현재 테마 상태 가져오기
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

    // 알림 관련 상태 가져오기
    const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

    // 현재 경로를 기준으로 모드 결정
    const getCurrentMode = () => {
        const path = location.pathname;
        if (path.includes('/diary')) return 'Diary';
        if (path.includes('/project')) return 'Project Journal';
        return 'Calendar';
    };

    // 테마 변경 핸들러
    const handleThemeChange = (isDark: boolean) => {
        dispatch(toggleTheme());
    };

  return (
    <>
    <div className="header">
        <div className="header__title">
            <div className="header__user">우감자의</div>
            <div className="header__mode">{ getCurrentMode() }</div>
        </div>
        <div className="header__icons">
            <BellIcon fill="var(--color-xl)" />
            <div onClick={() => setIsMyPageModalOpen(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <PersonIcon 
                    fill="var(--color-xl)"
                    width="18"
                    height="18"
                />
            </div>
            <div className="header__theme-switch">
                <ThemeSwitch 
                    isDarkMode={ isDarkMode }
                    onThemeChange={ handleThemeChange }    
                />
            </div>
        </div>
    </div>

    <MyPageModal isOpen={isMyPageModalOpen} onClose={() => setIsMyPageModalOpen(false)}/>
    </>
  );
}

export default Header;
