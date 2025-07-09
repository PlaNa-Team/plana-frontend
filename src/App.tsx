import React from 'react';
// React Router의 라우팅 컴포넌트들 가져오기
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Redux 상태를 React 앱에 연결하는 Provider
import { Provider } from 'react-redux';
// 우리가 만든 Redux 스토어 가져오기
import { store } from './store';
// Redux 상태를 읽어오는 커스텀 훅
import { useAppSelector } from './store';

// 페이지 컴포넌트들
import Landing from './pages/Landing';
import { Login } from './pages/auth';           // auth/index.ts에서 export된 Login
import { Calendar } from './pages/calendar';    // calendar/index.ts에서 export된 Calendar
import { Diary } from './pages/diary';          // diary/index.ts에서 export된 Diary
import { Project } from './pages/project';      // project/index.ts에서 export된 Project

// 레이아웃 컴포넌트
import Layout from './components/common/Layout';

// 스타일
import './App.scss';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* 공개 페이지들 (레이아웃 없음) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* 메인 앱 페이지들 (레이아웃 적용) */}
          <Route path="/calendar" element={
            <Layout>
              <Calendar />
            </Layout>
          } />
          
          <Route path="/diary" element={
            <Layout>
              <Diary />
            </Layout>
          } />
          
          <Route path="/project" element={
            <Layout>
              <Project />
            </Layout>
          } />
          
          {/* 기본적으로 캘린더로 리다이렉트 */}
          <Route path="/app" element={
            <Layout>
              <Calendar />
            </Layout>
          } />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;