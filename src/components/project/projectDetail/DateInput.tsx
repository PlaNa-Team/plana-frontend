import React from 'react'

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

export default DateInput