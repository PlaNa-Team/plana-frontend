import React from 'react'
import { ProjectStatus } from '../../../types'

interface MonthCellProps {
    month: number;
    projectId: number;
    startMonth?: number;
    endMonth?: number;
    status: ProjectStatus;
    onPeriodChange: (projectId: number, startMonth?: number, endMonth?: number) => void;
}

const MonthCell: React.FC<MonthCellProps> = ({
    month, projectId, startMonth, endMonth, status, onPeriodChange }) => {
        const handleClick = () => {
            if (!startMonth || (startMonth && endMonth)) {
                // 첫 번째 클릭 또는 이미 완료된 기간이 있는 경우 - 새로운 시작점 설정
                onPeriodChange(projectId, month, undefined);
            } else if (startMonth && !endMonth) {
                // 두 번째 클릭 - 종료점 설정
                if (month >= startMonth) {
                    onPeriodChange(projectId, startMonth, month);
                } else {
                    // 시작점이 종료점보다 큰 경우 - 시작점과 종료점을 바꿈
                    onPeriodChange(projectId, month, startMonth);
                }
            }
        };

        const getStatusColor = ( status: ProjectStatus ) => {
            switch (status) {
                case '진행':
                    return 'bg-[#53A75A]-400';
                case '완료':
                    return 'bg-[#338CD9]-400';
                case '중단':
                    return 'bg-[#E48485]-400';
                default:
                    return 'bg-[#7E7E7E]-400';
            }
        };

        const isInRange = () => {
            if (!startMonth) return false;
            if (!endMonth) return month === startMonth;
            return month >= startMonth && month <= endMonth;
        };

        const isStartMonth = () => startMonth === month;
        const isEndMonth = () => endMonth === month;

        return (
            <div
                className={`month-cell ${isInRange() ? 'month-cell--selected' : ''} ${isStartMonth() ? 'month-cell--start' : ''} ${isEndMonth() ? 'month-cell--end' : ''}`}
                onClick={handleClick}
                style={{
                    '--status-color': getStatusColor(status),
                    backgroundColor: isInRange() ? getStatusColor(status) : 'transparent',
                } as React.CSSProperties}
            >
                <span className="month-cell__content">
                    {isStartMonth() && '●'}
                    {isEndMonth() && '●'}
                </span>
            </div>
        );
    };


export default MonthCell