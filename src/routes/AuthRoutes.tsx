// 로그인, 회원가입 관련 route
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Props 타입 정의
interface AuthRouteProps {
  children: React.ReactNode;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

// 로그인이 필요한 페이지를 보호하는 컴포넌트
export const ProtectedRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 로그인된 사용자가 접근하면 안 되는 페이지 (로그인, 회원가입 등)
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // 이미 로그인된 경우 메인 페이지로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/calendar" replace />;
  }
  
  return <>{children}</>;
};