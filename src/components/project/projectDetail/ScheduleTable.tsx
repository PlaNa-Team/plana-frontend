import React, { useState } from 'react'
import { JournalDetailSchedule } from '../../../types';
import { DateInput, DetailInput, StarIcon } from './index';
import CustomAlertDialog from '../../ui/AlertDialog';

interface ScheduleTableProps {
    schedules: JournalDetailSchedule[];
    isPast?: boolean;
    onUpdateSchedule: (scheduleId: number, updates: Partial<JournalDetailSchedule>) => void;
    onDeleteSchedule: (scheduleId: number) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
    schedules, 
    isPast = false, 
    onUpdateSchedule, 
    onDeleteSchedule 
}) => {
    // 삭제할 스케줄 ID와 다이얼로그 상태 관리
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);

    const handleDeleteClick = (scheduleId: number) => {
        setScheduleToDelete(scheduleId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (scheduleToDelete !== null) {
            onDeleteSchedule(scheduleToDelete);
            setScheduleToDelete(null);
        }
    };

    const handleDialogClose = () => {
        setDeleteDialogOpen(false);
        setScheduleToDelete(null);
    };

    return (
        <>
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
                                    onClick={() => onUpdateSchedule(schedule.id, { isImportant: !schedule.isImportant })}
                                />
                            </td>
                            <td className="date-cell">
                                <DateInput
                                    value={schedule.startDate}
                                    onChange={(value) => onUpdateSchedule(schedule.id, { startDate: value })}
                                />
                            </td>
                            <td className="date-cell">
                                <DateInput
                                    value={schedule.endDate}
                                    onChange={(value) => onUpdateSchedule(schedule.id, { endDate: value })}
                                    min={schedule.startDate}
                                />
                            </td>
                            <td className="detail-cell">
                                <DetailInput
                                    value={schedule.detail || ''}
                                    onChange={(value) => onUpdateSchedule(schedule.id, { detail: value })}
                                    isPast={isPast}
                                />
                            </td>
                            <td className="delete-cell">
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteClick(schedule.id)}
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 스케줄 삭제 확인 다이얼로그 */}
            <CustomAlertDialog
                title="스케줄 삭제"
                description="이 스케줄을 삭제하시겠습니까? 삭제된 스케줄은 복구할 수 없습니다."
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                confirmText="삭제"
                cancelText="취소"
                onConfirm={confirmDelete}
                onCancel={handleDialogClose}
            />
        </>
    );
};

export default ScheduleTable