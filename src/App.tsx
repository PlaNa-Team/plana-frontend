import React from 'react';
// React Router의 라우팅 컴포넌트들 가져오기
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import './App.css';

// 보호된 라우트 컴포넌트 (로그인이 필요한 페이지들)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  // Redux에서 로그인 상태 가져오기
  
  // 로그인이 안 되어있으면 랜딩 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // 로그인이 되어있으면 원래 페이지 렌더링
  return <>{children}</>;
};

// 공개 라우트 컴포넌트 (로그인 안 된 상태에서만 접근 가능)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  // Redux에서 로그인 상태 가져오기
  
  // 이미 로그인이 되어있으면 캘린더 페이지로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/calendar" replace />;
  }
  
  // 로그인이 안 되어있으면 원래 페이지 렌더링
  return <>{children}</>;
};

// 앱 내부 라우팅 컴포넌트
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트들 (로그인 전에만 접근 가능) */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Landing />  {/* 랜딩 페이지 */}
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />    {/* 로그인 페이지 */}
            </PublicRoute>
          } 
        />
        
        {/* 보호된 라우트들 (로그인 후에만 접근 가능) */}
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />  {/* 캘린더 페이지 */}
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diary" 
          element={
            <ProtectedRoute>
              <Layout>
                <Diary />     {/* 다이어리 페이지 */}
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project" 
          element={
            <ProtectedRoute>
              <Layout>
                <Project />   {/* 프로젝트 페이지 */}
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* 잘못된 경로로 접근 시 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    // Redux Provider로 전체 앱을 감싸서 모든 컴포넌트에서 상태 사용 가능
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
