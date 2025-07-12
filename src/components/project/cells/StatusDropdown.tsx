import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export type StatusType = '예정' | '진행' | '완료' | '중단';

interface StatusDropdownProps {
  value?: StatusType;
  onChange?: (status: StatusType) => void;
  disabled?: boolean;
}

const STATUS_COLORS = {
  '예정': '#f0ad4e',
  '진행': '#5bc0de',
  '완료': '#5cb85c',
  '중단': '#d9534f'
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

  return (
    <div className="status-dropdown">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button 
            className={`status-dropdown__trigger ${getStatusClass(selectedStatus)}`}
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