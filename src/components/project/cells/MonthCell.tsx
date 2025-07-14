import React from 'react'
import { ProjectStatus } from '../../../types'

interface MonthCellProps {
    month: number;
    projectId: number;
    startMonth?: number;
    endMonth?: number;
    status: ProjectStatus;
    onPeriodChange: (projectId: number, startMonth?: number, endMonth?: number) => void;
    hasTitle?: boolean;
}

const MonthCell: React.FC<MonthCellProps> = ({
    month, projectId, startMonth, endMonth, status, onPeriodChange, hasTitle=false }) => {
    
    const isInRange = () => {
        if (startMonth === undefined) return false;
        if (endMonth === undefined) return month === startMonth;
        return month >= startMonth && month <= endMonth;
    };
    
    const handleClick = () => {        
        // Title이 없으면 클릭 불가능
         if (!hasTitle) return;

        if (startMonth === undefined || (startMonth && endMonth)) {
            onPeriodChange(projectId, month, undefined);
        } else if (startMonth && endMonth === undefined) {
            if (month >= startMonth) {
                onPeriodChange(projectId, startMonth, month);
            } else {
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

    const isStartMonth = (): boolean => startMonth === month;
    const isEndMonth = (): boolean => endMonth === month;

    const statusColor = getStatusColor(status);
    const backgroundColor = isInRange() ? statusColor : 'transparent';

    return (
        <div
            className={`month-cell ${isInRange() ? 'month-cell--selected' : ''} ${isStartMonth() ? 'month-cell--start' : ''} ${isEndMonth() ? 'month-cell--end' : ''}`}
            onClick={handleClick}
            style={{
                backgroundColor,
                color: isInRange() ? 'white' : 'inherit',
                cursor: 'pointer', // 항상 pointer로 설정
                opacity: 0.3,
                minHeight: '2.5rem', // 클릭 영역 확보
            }}
        >
            <span className="month-cell__content">
                {isStartMonth()}
                {isEndMonth()}
            </span>
        </div>
    );
};

export default MonthCell