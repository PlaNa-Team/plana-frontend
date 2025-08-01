import React from 'react';

interface XIconProps {
    width?: number | string;
    height?: number | string;
    fill?: string;
    className?: string;
    onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
}

const XIcon: React.FC<XIconProps> = ({
    width = 25,
    height = 25,
    fill = 'currentColor',
    className,
    onClick
}) => {
    return (
        <svg 
            width={ width } 
            height={ height } 
            viewBox="0 0 25 25" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={ className }
            onClick={ onClick }
        >
        <path d="M1 24L12.5 12.5M12.5 12.5L24 1M12.5 12.5L1 1M12.5 12.5L24 24" stroke={ fill } stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
};

export default XIcon;
