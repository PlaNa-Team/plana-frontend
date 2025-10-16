import React , { useState , useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BellIcon, PersonIcon } from '../../assets/icons';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { toggleTheme } from '../../store/slices/themeSlice';
import { RootState } from '../../store';
import  Popover  from '../ui/Popover';
import MyPageModal from '../ui/MyPageModal';
import { fetchNotifications } from '../../store/slices/notiSlice';


function Header() {
    
    const location = useLocation();
    const dispatch = useDispatch();
    const [isMyPageModalOpen, setIsMyPageModalOpen] = useState(false);

    useEffect(() => {
        // 앱 로드 시 최초 1회 unreadCount를 가져와 빨간불을 띄웁니다.
        dispatch((fetchNotifications() as any));
    }, [dispatch]);
    // Redux store에서 현재 테마 상태 가져오기
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

    const user = useSelector((state: RootState) => state.auth.user);
    const userNicename = user?.nickname; // user 객체에서 name 속성을 가져옵니다.

    // 알림 관련 상태 가져오기
    const unreadCount = useSelector((state: RootState) => state.notifications?.unreadCount ?? 0);

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
            <div className="header__user">{userNicename ? `${userNicename}의` : '사용자'}</div>
            <div className="header__mode">{ getCurrentMode() }</div>
        </div>
        <div className="header__icons">
            <Popover> 
                <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <BellIcon 
                        // onClick 핸들러 제거: Popover.Trigger가 클릭 이벤트를 처리합니다.
                        fill="var(--color-xl)"
                    />
                     {/* ⭐ 수정: unreadCount > 0 일 때 숫자 대신 빈 배지(빨간불)만 표시 */}
                             {unreadCount > 0 && (
                // unreadCount는 제거하고, 스타일링된 빈 div만 남겨서 '빨간 점' 역할만 수행하도록 합니다.
                <div className="notification-badge notification-dot">
                    {unreadCount}
                    {/* 숫자는 표시하지 않습니다. */}
                </div>
            )}
                </div>
            </Popover>
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
