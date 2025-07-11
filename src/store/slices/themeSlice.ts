import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
    isDarkMode: boolean; // 다크 모드 여부
}

const initialState: ThemeState = {
    // 로컬스토리지에서 이전 설정 불러오기, 없으면 시스템 설정 사용
    isDarkMode: (() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // 시스템 다크모드 설정 확인
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    })(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.isDarkMode = !state.isDarkMode;
            // 로컬스토리지에 저장
            localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
            // HTML 클래스 토글
            document.documentElement.classList.toggle('dark', state.isDarkMode);
        },
        setTheme: (state, action: PayloadAction<boolean>) => {
            state.isDarkMode = action.payload;
            localStorage.setItem('theme', action.payload ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', action.payload);
        },
        initializeTheme: (state) => {
            // 앱 시작 시 HTML 클래스 설정
            document.documentElement.classList.toggle('dark', state.isDarkMode);
        }
    },
});

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;