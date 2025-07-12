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
            if (startMonth === undefined || (startMonth && endMonth)) {
                // 첫 번째 클릭 또는 이미 완료된 기간이 있는 경우 - 새로운 시작점 설정
                onPeriodChange(projectId, month, undefined);
            } else if (startMonth && endMonth === undefined) {
                // 두 번째 클릭 - 종료점 설정
                if (month >= startMonth) {
                    onPeriodChange(projectId, startMonth, month);
                } else {
                    // 시작점이 종료점보다 큰 경우 - 시작점과 종료점을 바꿈
                    onPeriodChange(projectId, month, startMonth);
                }
            }
        };

        const getStatusColor = (status: ProjectStatus): string => {
            switch (status) {
                case '진행':
                    return '#53A75A';
                case '완료':
                    return '#338CD9';
                case '중단':
                    return '#E48485';
                case '예정':
                default:
                    return '#7E7E7E';
            }
        };

        const isInRange = () => {
            if (startMonth === undefined) return false;
            if (endMonth === undefined) return month === startMonth;
            return month >= startMonth && month <= endMonth;
        };

        const isStartMonth = (): boolean => startMonth === month;
        const isEndMonth = (): boolean => endMonth === month;

        const statusColor = getStatusColor(status);
        const backgroundColor = isInRange() ? `${statusColor}66` : 'transparent';

        return (
            <div
                className={`month-cell ${isInRange() ? 'month-cell--selected' : ''} ${isStartMonth() ? 'month-cell--start' : ''} ${isEndMonth() ? 'month-cell--end' : ''}`}
                onClick={handleClick}
                style={{
                    backgroundColor,
                    color: isInRange() ? 'var(--color-xs)' : 'inherit',
                }}
            >
                <span className="month-cell__content">
                    {isStartMonth() && '●'}
                    {isEndMonth() && '●'}
                </span>
            </div>
        );
    };


export default MonthCell