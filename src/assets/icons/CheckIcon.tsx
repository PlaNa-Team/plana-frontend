import React from 'react';

interface CheckIconProps {
    width?: number | string;
    height?: number | string;
    fill?: string;
    className?: string;
    onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
}

const CheckIcon: React.FC<CheckIconProps> = ({
    width = 26,
    height = 18,
    fill = 'currentColor',
    className,
    onClick
}) => {
    return (
        <svg 
            width={ width } 
            height={ height } 
            viewBox="0 0 26 18" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={ className }
            onClick={ onClick }
        >
        <path d="M25 1L9 17L1 9" stroke={ fill } stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
};

export default CheckIcon;
