import React, { useState, useEffect } from 'react'
import { JournalDetailSchedule } from '../../types'
import { ScheduleTable } from './projectDetail'

interface ProjectDetailTableProps {
    projectId: number;
    projectTitle: string;
    initialSchedules?: JournalDetailSchedule[];
    onSchedulesChange?: (schedules: JournalDetailSchedule[]) => void;
}

const ProjectDetailTable: React.FC<ProjectDetailTableProps> = ({
    projectId,
    projectTitle,
    initialSchedules = [],
    onSchedulesChange
}) => {
    // 새 스케줄 생성 헬퍼 함수
    const createNewSchedule = (): JournalDetailSchedule => {
        const currentDate = new Date().toISOString().split('T')[0];
        return {
            id: Date.now(), // 임시 ID
            projectId,
            memberId: 1, // 예시
            isImportant: false,
            startDate: currentDate,
            endDate: currentDate,
            detail: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false
        };
    };

    const getInitialSchedules = (): JournalDetailSchedule[] => {
        const activeSchedules = initialSchedules.filter(schedule => !schedule.isDeleted);
        return activeSchedules.length === 0 ? [createNewSchedule()] : initialSchedules;
    };

    const [ schedules, setSchedules ] = useState<JournalDetailSchedule[]>(getInitialSchedules());

    useEffect(() => {
        setSchedules(getInitialSchedules());
    }, [projectId]);

    useEffect(() => {
        onSchedulesChange?.(schedules);
    }, [ schedules, onSchedulesChange ]);

    const currentDate = new Date().toISOString().split('T')[0];

    // 현재/미래 계획과 과거 계획 분리
    const currentSchedules = schedules.filter(schedule => 
        !schedule.isDeleted && schedule.endDate >= currentDate
    );
    const pastSchedules = schedules.filter(schedule => 
        !schedule.isDeleted && schedule.endDate < currentDate
    );

    const addNewSchedule = () => {
        setSchedules(prev => [...prev, createNewSchedule()]);
    };

    const updateSchedule = (scheduleId: number, updates: Partial<JournalDetailSchedule>) => {
        setSchedules(prev =>
            prev.map(schedule => 
                schedule.id === scheduleId
                    ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
                    : schedule
            )
        );
    };

    const deleteSchedule = (scheduleId: number) => {
        setSchedules(prev => 
            prev.map(schedule =>
                schedule.id === scheduleId
                    ? { ...schedule, isDeleted: true, deletedAt: new Date().toISOString() }
                    : schedule
            )
        );
    };

    const deleteProject = () => {
        if (window.confirm('현재 프로젝트를 삭제하시겠습니까?')) {
            // 이 부분 팝업창으로 변경
            console.log('프로젝트 삭제: ', projectId);
        }
    };

    return (
        <div className="project-detail">
            <h2 className="project-detail__title">{ projectTitle }</h2>

            {/* 현재~미래 계획 테이블 */}
            <div className="project-detail__section">
                <ScheduleTable 
                    schedules={currentSchedules}
                    onUpdateSchedule={updateSchedule}
                    onDeleteSchedule={deleteSchedule}
                    onAddNewSchedule={addNewSchedule}
                />
            </div>

            {/* 새 계획 추가 버튼 */}
            <div className="project-detail__add-button">
                <button 
                    className="add-schedule-button" 
                    onClick={addNewSchedule}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            {/* 과거 계획 테이블 */}
            {pastSchedules.length > 0 && (
                <div className="project-detail__section">
                    <ScheduleTable 
                        schedules={pastSchedules} 
                        isPast={true}
                        onUpdateSchedule={updateSchedule}
                        onDeleteSchedule={deleteSchedule}
                        onAddNewSchedule={addNewSchedule}
                    />
                </div>
            )}

            {/* 프로젝트 삭제 버튼 */}
            <div className="project-detail__delete">
                <button className="delete-project-button" onClick={deleteProject}>
                    현재 프로젝트 삭제
                </button>
            </div>
        </div>
    );
};

export default ProjectDetailTable