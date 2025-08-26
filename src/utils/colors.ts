// 색상명을 HEX 코드로 매핑하는 상수
export const COLOR_MAP = {
  black: '#000000',
  pink: '#FFBCD1',
  red: '#FF8888',
  orange: '#FFAF73',
  yellow: '#FFF06A',
  green: '#C2FF9E',
  blue: '#B8FFFD',
  purple: '#D7AAFF',
  gray: '#E2E3E5',
  white: '#FFFFFF'
} as const;

// 타입 정의
export type ColorName = keyof typeof COLOR_MAP;
export type ColorHex = typeof COLOR_MAP[ColorName];

// HEX 코드를 색상명으로 변환하는 함수
export const getColorNameFromHex = (hex: string): ColorName | null => {
  const entry = Object.entries(COLOR_MAP).find(([_, value]) => value.toLowerCase() === hex.toLowerCase());
  return entry ? entry[0] as ColorName : null;
};

// 색상명을 HEX 코드로 변환하는 함수
export const getHexFromColorName = (colorName: string): string => {
  return COLOR_MAP[colorName as ColorName] || colorName;
};