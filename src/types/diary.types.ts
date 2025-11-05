// TypeScript 타입 정의 - 다이어리 관련 타입

export interface Diary {
  id: number;
  diaryDate: string; // yyyy-MM-dd
  diaryType: string; // DAILY, BOOK, MOVIE
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// ===== 콘텐츠 타입별 세부 구조 =====

export interface Daily {
  id: number;
  title: string;
  location?: string;
  memo?: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  publisher?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  rating?: number;
  comment?: string;
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

// ===== 메모 관련 =====

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

// ===== 다이어리 태그 관련 =====

export interface FriendTag {
  id: number;
  memberId?: number;
  loginId?: string;
  memberNickname?: string;
  tagText?: string;
  tagStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface DiaryTagRequest {
  memberId?: number;
  tagText?: string;
}

// ===== 콘텐츠 타입별 요청 데이터 =====

export interface DailyContent {
  title: string;
  location?: string;
  memo?: string;
  imageUrl?: string | null;
}

export interface BookContent {
  title: string;
  author?: string;
  publisher?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  reread?: boolean;
  rating?: number;
  comment?: string;
  imageUrl?: string | null;
}

export interface MovieContent {
  title: string;
  director?: string;
  actors?: string;
  genre?: string;
  releaseDate?: string;
  rewatch?: boolean;
  rating?: number;
  comment?: string;
  imageUrl?: string | null;
}

// ===== 월간 다이어리 조회 =====

export interface MonthlyDiaryItem {
  id: number;
  diaryDate: string;
  type: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  title: string;
}

export interface MonthlyDiaryResponse {
  status: number;
  body: {
      data: {
          diaryList: MonthlyDiaryItem[];
      };
  };
}

// ===== 다이어리 등록/수정 요청 =====

export interface CreateDiaryRequest {
  diaryDate: string;
  diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  content: DailyContent | BookContent | MovieContent;
  diaryTags?: DiaryTagRequest[];
}

export interface UpdateDiaryRequest extends CreateDiaryRequest {}

// ===== 다이어리 등록/수정 응답 =====

export interface DiaryCreateResponse {
  status: number;
  body: {
      data: DiaryDetail;
  };
}

// ===== 락 관련 응답 =====

export interface LockAcquireResponse {
  acquired: boolean;
  expiresAt: string; // "2025-09-28T12:24:06.735098400Z"
  token: string;
  ownerId: number;
  ttlSeconds: number;
}

export interface LockRenewResponse {
  acquired: boolean;
  expiresAt: string;
  ttlSeconds: number;
}

// ===== 다이어리 상세 정보 =====

export interface DiaryDetail {
  id: number;
  diaryDate: string;
  diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  content: DailyContent | BookContent | MovieContent;
  diaryTags?: FriendTag[];
}

export interface DiaryDetailResponse {
  status: number;
  body: {
      data: DiaryDetail;
      lockInfo?: LockAcquireResponse;
  };
}

// ===== 이미지 임시 업로드 응답 =====

export interface TempImageResponse {
  status: number;
  data: {
      tempUrl: string;
      tempId: string;
      expiresAt: string;
  };
}

// ===== 다이어리 삭제 응답 =====

export interface DiaryDeleteResponse {
  status: number;
  body: {
      data: null;
  };
}

// ===== 친구 검색 관련 =====

export interface FriendItem {
  id: number;
  loginId: string;
}

export interface FriendSearchResponse {
  count: number;
  data: FriendItem[];
  status: number;
}