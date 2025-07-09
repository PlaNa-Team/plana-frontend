import React from 'react';

const Diary: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>다이어리 페이지</h2>
      <p>일기 작성 영역입니다.</p>
      <textarea 
        style={{ width: '100%', height: '300px', padding: '10px', borderRadius: '8px' }}
        placeholder="오늘의 일기를 작성해보세요..."
      />
    </div>
  );
};

export default Diary;