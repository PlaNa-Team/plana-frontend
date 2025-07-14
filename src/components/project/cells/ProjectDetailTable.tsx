import React, { useState, useEffect } from 'react'
import { JournalDetailSchedule } from '../../../types'

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
    const [ schedules, setSchedules ] = useState<JournalDetailSchedule[]>(initialSchedules);

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
        const newSchedule: JournalDetailSchedule = {
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
        setSchedules(prev => [...prev, newSchedule]);
    };

    const updateSchedule = (scheduleId: number, updates: Partial<JournalDetailSchedule>) => {
        setSchedules(prev =>
            prev.map(schedule => 
                schedule.id === scheduleId
                    ? { ...schedule, ...updates, updateAt: new Date().toISOString() }
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

    const StarIcon: React.FC<{ filled: boolean; onClick: () => void }> = ({ filled, onClick }) => (
        <button className="star-button" onClick={onClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#FFD700" : "none"} stroke="#FFD700" strokeWidth="1">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
        </button>
    );

    const DateInput: React.FC<{
        value: string;
        onChange: (value: string) => void;
        min?: string;
    }> = ({ value, onChange, min }) => (
        <input
            type="date"
            value={ value }
            onChange={(e) => onChange(e.target.value)}
            min={ min }
            className="date-input"
        />
    );

    const DetailInput: React.FC<{
        value: string;
        onChange: (value: string) => void;
        isPast?: boolean;
    }> = ({ value, onChange, isPast = false }) => (
        <textarea
            value={ value }
            onChange={(e) => onChange(e.target.value)}
            placeholder='계획 내용을 입력하세요'
            className={`detail-input ${isPast ? 'detail-input--past' : ''}`}
            rows={1}
        />
    );

    const ScheduleTable: React.FC<{
        schedules: JournalDetailSchedule[];
        isPast?: boolean;
    }> = ({ schedules, isPast = false }) => (
        <table className="project-detail-table">
            <thead>
                <tr>
                    <th></th>
                    <th>중요도</th>
                    <th>시작일</th>
                    <th>종료일</th>
                    <th>계획 내용</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {schedules.map((schedule, index) => (
                    <tr key={schedule.id}>
                        <td className="no-cell">{index + 1}</td>
                        <td className="importance-cell">
                            <StarIcon
                                filled={schedule.isImportant}
                                onClick={() => updateSchedule(schedule.id, { isImportant: !schedule.isImportant })}
                            />
                        </td>
                        <td className="date-cell">
                            <DateInput
                                value={schedule.startDate}
                                onChange={(value) => updateSchedule(schedule.id, { startDate: value })}
                            />
                        </td>
                        <td className="date-cell">
                            <DateInput
                                value={schedule.endDate}
                                onChange={(value) => updateSchedule(schedule.id, { endDate: value })}
                                min={schedule.startDate}
                            />
                        </td>
                        <td className="detail-cell">
                            <DetailInput
                                value={schedule.detail || ''}
                                onChange={(value) => updateSchedule(schedule.id, { detail: value })}
                                isPast={isPast}
                            />
                        </td>
                        <td className="delete-cell">
                            <button
                                className="delete-button"
                                onClick={() => deleteSchedule(schedule.id)}
                            >
                                삭제
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="project-detail">
            <h2 className="project-detail__title">{ projectTitle }</h2>

            {/* 현재~미래 계획 테이블 */}
            <div className="project-detail__section">
                <ScheduleTable schedules={currentSchedules}/>
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
                    <ScheduleTable schedules={pastSchedules} isPast={true}/>
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