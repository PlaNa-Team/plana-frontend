import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>PlaNa 일정 관리</h1>
      <p>환영합니다!</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login" style={{ marginRight: '10px' }}>
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            로그인 하러가기
          </button>
        </Link>
        <Link to="/calendar">
          <button style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white' }}>
            바로 캘린더 보기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Landing;