import React from 'react';
import ProjectTable from '../../components/project/ProjectTable';

const Project: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>프로젝트 저널 페이지</h2>
      <p>프로젝트 관리 영역입니다.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
          <h3>프로젝트 1</h3>
          <p>진행중</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
          <h3>프로젝트 2</h3>
          <p>완료</p>
        </div>
      </div>
    </div>
  );
};

export default Project;