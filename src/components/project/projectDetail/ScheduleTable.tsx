import React from 'react'
import { JournalDetailSchedule } from '../../../types';
import { DateInput, DetailInput, StarIcon } from './index';

const ScheduleTable: React.FC<{
    schedules: JournalDetailSchedule[];
    isPast?: boolean;
    onUpdateSchedule: (scheduleId: number, updates: Partial<JournalDetailSchedule>) => void;
    onDeleteSchedule: (scheduleId: number) => void;
    onAddNewSchedule?: () => void;
}> = ({ schedules, isPast = false, onUpdateSchedule, onDeleteSchedule, onAddNewSchedule }) => (
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
                            onCtrlEnter={onAddNewSchedule}
                        />
                    </td>
                    <td className="delete-cell">
                        <button
                            className="delete-button"
                            onClick={() => onDeleteSchedule(schedule.id)}
                        >
                            삭제
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default ScheduleTable