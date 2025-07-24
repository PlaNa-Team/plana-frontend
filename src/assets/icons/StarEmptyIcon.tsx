import React from 'react';

interface StarEmptyIconProps {
    width?: number | string;
    height?: number | string;
    fill?: string;
    className?: string;
}

const StarEmptyIcon: React.FC<StarEmptyIconProps> = ({
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
        <path d="M8.85 16.825L12 14.925L15.15 16.85L14.325 13.25L17.1 10.85L13.45 10.525L12 7.125L10.55 10.5L6.9 10.825L9.675 13.25L8.85 16.825ZM5.825 21L7.45 13.975L2 9.25L9.2 8.625L12 2L14.8 8.625L22 9.25L16.55 13.975L18.175 21L12 17.275L5.825 21Z" fill={ fill }/>
        </svg>
    );
};

export default StarEmptyIcon;
