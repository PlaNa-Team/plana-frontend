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

// === API 응답 관련 타입 추가 ===

export interface FriendTag {
  id: number;
  memberId?: number;
  loginId?: string;
  memberNickname?: string;
  tagText?: string;
  tagStatus: 'PENDING' | '수락' | '거절' | '삭제' | '작성자';
}

// 월간 다이어리 조회 응답
export interface MonthlyDiaryItem {
  id: number;
  diaryDate: string;
  diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  title: string;
}

export interface MonthlyDiaryResponse {
  status: number;
  message: string;
  body: {
    data: {
      diaryList: MonthlyDiaryItem[];
    };
  }
}

// 다이어리 상세 조회 응답 (공통)
export interface DiaryDetailBase {
  id: number;
  diaryDate: string;
  diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  content: DailyContent | BookContent | MovieContent;
  diaryTags: FriendTag[];
}

// DAILY 타입 상세
export interface DailyDiaryDetail extends DiaryDetailBase {
  diaryType: 'DAILY';
  location?: string;
  memo?: string;
}

// BOOK 타입 상세
export interface BookDiaryDetail extends DiaryDetailBase {
  diaryType: 'BOOK';
  author?: string;
  publisher?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  rating?: number;
  comment?: string;
}

// MOVIE 타입 상세
export interface MovieDiaryDetail extends DiaryDetailBase {
  diaryType: 'MOVIE';
  director?: string;
  actors?: string;
  genre?: string;
  rewatch?: boolean;
  rating?: number;
  comment?: string;
}

export type DiaryDetail = DailyDiaryDetail | BookDiaryDetail | MovieDiaryDetail;

export interface DiaryDetailResponse {
  status: number;
  message?: string;
  data: DiaryDetail;
}

// 이미지 임시 업로드 응답
export interface TempImageResponse {
  status: number;
  data: {
    tempUrl: string;
  };
}

// 다이어리 등록/수정 요청
export interface CreateDiaryRequest {
  diaryDate: string;
  diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  content: DailyContent | BookContent | MovieContent;
  diaryTags?: DiaryTagRequest[];
}

export interface UpdateDiaryRequest extends CreateDiaryRequest {}

export interface DiaryTagRequest {
  memberId?: number;
  tagText?: string;
}

// 콘텐츠 타입별 요청 데이터
export interface DailyContent {
  title: string;
  location?: string;
  memo?: string;
}

export interface BookContent {
  title: string;
  author?: string;
  publisher?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  rating?: number;
  comment?: string;
}

export interface MovieContent {
  title: string;
  director?: string;
  actors?: string;
  genre?: string;
  rewatch?: boolean;
  rating?: number;
  comment?: string;
}

// 다이어리 등록/수정 응답
export interface DiaryCreateResponse {
  status: number;
  body: {
    data: DiaryDetail;
  };
}

// 다이어리 삭제 응답
export interface DiaryDeleteResponse {
  status: number;
  body: {
    message: string;
  };
}

// 에러 응답
export interface DiaryErrorResponse {
  status: number;
  body: {
    success: false;
    error: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}