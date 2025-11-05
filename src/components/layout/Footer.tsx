import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CalendarIcon, DiaryIcon, ProjectIcon } from '../../assets/icons'

function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  // 현재 활성 페이지 확인
  const isActive = (path: string) => location.pathname.includes(path)

  return (
    <div className="footer">
      <div 
        className={`footer__containers ${isActive('/calendar') ? 'footer__containers--active' : ''}`}
        onClick={() => navigate('/calendar')}
      >
        <CalendarIcon 
          fill={isActive('/calendar') ? 'var(--color-xl)' : 'var(--color-md)'}
          className="footer__icons"
        />
        <p className="footer__titles">캘린더</p>
      </div>

      <div 
        className={`footer__containers ${isActive('/diary') ? 'footer__containers--active' : ''}`}
        onClick={() => navigate('/diary')}
      >
        <DiaryIcon 
          fill={isActive('/diary') ? 'var(--color-xl)' : 'var(--color-md)'}
          className="footer__icons"
        />
        <p className="footer__titles">다이어리</p>
      </div>

      {/*    현재 프로젝트 저널 미개발 향후 디벨롭 예정.   <div 
        className={`footer__containers ${isActive('/project') ? 'footer__containers--active' : ''}`}
        onClick={() => navigate('/project')}
      >
        <ProjectIcon 
          fill={isActive('/project') ? 'var(--color-xl)' : 'var(--color-md)'}
          className="footer__icons"
        />
        <p className="footer__titles">프로젝트</p>
      </div> */}
      
      
    </div>
  )
}

export default Footer
