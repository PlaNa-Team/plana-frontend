import React from 'react';

interface TrashBinIconProps {
    width?: number | string;
    height?: number | string;
    fill?: string;
    className?: string;
    onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
}

const TrashBinIcon: React.FC<TrashBinIconProps> = ({
    width = 30,
    height = 32,
    fill = 'currentColor',
    className,
    onClick
}) => {
    return (
        <svg 
            width={ width } 
            height={ height } 
            viewBox="0 0 37 40" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={ className }
            onClick={ onClick }
        >
        <path d="M6.66675 11.6667H33.3334M16.6667 18.3333V28.3333M23.3334 18.3333V28.3333M8.33341 11.6667L10.0001 31.6667C10.0001 32.5507 10.3513 33.3986 10.9764 34.0237C11.6015 34.6488 12.4494 35 13.3334 35H26.6667C27.5508 35 28.3986 34.6488 29.0238 34.0237C29.6489 33.3986 30.0001 32.5507 30.0001 31.6667L31.6667 11.6667M15.0001 11.6667V6.66667C15.0001 6.22464 15.1757 5.80072 15.4882 5.48816C15.8008 5.17559 16.2247 5 16.6667 5H23.3334C23.7754 5 24.1994 5.17559 24.5119 5.48816C24.8245 5.80072 25.0001 6.22464 25.0001 6.66667V11.6667" stroke={ fill } stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
};

export default TrashBinIcon;
