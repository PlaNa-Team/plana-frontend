import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export type StatusType = '예정' | '진행' | '완료' | '중단';

interface StatusDropdownProps {
  value?: StatusType;
  onChange?: (status: StatusType) => void;
  disabled?: boolean;
}

const STATUS_COLORS = {
  '예정': '#7E7E7E',
  '진행': '#53A75A',
  '완료': '#338CD9',
  '중단': '#E48485'
} as const;

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value = '예정',
  onChange,
  disabled = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(value);

  const statusOptions: StatusType[] = ['예정', '진행', '완료', '중단'];

  const handleStatusChange = (status: StatusType) => {
    setSelectedStatus(status);
    onChange?.(status);
  };

  const getStatusClass = (status: StatusType) => {
    switch (status) {
      case '예정':
        return 'status-scheduled';
      case '진행':
        return 'status-progress';
      case '완료':
        return 'status-completed';
      case '중단':
        return 'status-paused';
      default:
        return 'status-scheduled';
    }
  };

  // 상태별 스타일 반환
  const getStatusStyle = (status: StatusType) => {
    const color = STATUS_COLORS[status];
    return {
      '--status-color': color,
      '--status-bg-color': `${color}40`,
    } as React.CSSProperties;
  };

  return (
    <div className="status-dropdown">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button 
            className={`status-dropdown__trigger ${getStatusClass(selectedStatus)}`}
            style={getStatusStyle(selectedStatus)}
            disabled={disabled}
          >
            <div className="status-dropdown__icon">●</div>
            <span className="status-dropdown__current">{selectedStatus}</span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="status-dropdown__content"
            sideOffset={4}
            align="start"
          >
            {statusOptions.map((status) => (
              <DropdownMenu.Item
                key={status}
                className={`status-dropdown__item ${getStatusClass(status)} ${
                  selectedStatus === status ? 'status-dropdown__item--selected' : ''
                }`}
                style={getStatusStyle(selectedStatus)}
                onSelect={() => handleStatusChange(status)}
              >
                {status}
                {selectedStatus === status && (
                  <span className="status-dropdown__check">✓</span>
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

export default StatusDropdown;