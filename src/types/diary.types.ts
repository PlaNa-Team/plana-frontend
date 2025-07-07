// TypeScript 타입 정의 - 다이어리 관련 타입
export interface Diary {
  id: number;
  diaryDate: string;   // yyyy-MM-dd
  diaryType: string;   // DAILY, BOOK, MOVIE
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Movie {
  id: number;
  title: string;
  director?: string;
  actors?: string;
  genre?: string;
  rewatch: boolean;
  rating?: number;
  comment?: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  publisher?: string;
  genre?: string;
  startDate?: string; // yyyy-MM-dd
  endDate?: string;   // yyyy-MM-dd
  rating?: number;
  comment?: string;
}

export interface Daily {
  id: number;
  title: string;
  location?: string;
  memo?: string;
}

export type MemoType = '다이어리' | '스케줄';

export interface Memo {
  id: number;
  memberId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  year: number;
  week: number;
  type: MemoType;
}
