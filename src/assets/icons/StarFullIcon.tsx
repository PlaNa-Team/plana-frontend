import React from 'react';

interface StarFullIconProps {
    width?: number | string;
    height?: number | string;
    fill?: string;
    className?: string;
}

const StarFullIcon: React.FC<StarFullIconProps> = ({
    width = 24,
    height = 24,
    fill = 'currentColor',
    className
}) => {
    return (
        <svg 
            width={ width } 
            height={ height } 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={ className }
        >
        <path d="M5.825 21L7.45 13.975L2 9.25L9.2 8.625L12 2L14.8 8.625L22 9.25L16.55 13.975L18.175 21L12 17.275L5.825 21Z" fill={ fill }/>
        </svg>
    );
};

export default StarFullIcon;
