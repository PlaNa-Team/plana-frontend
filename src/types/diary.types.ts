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
  endDate?: string; // yyyy-MM-dd
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

// 요청에 실제로 서버가 받는 친구 태그 타입
export interface DiaryTagRequest {
  memberId: number;
}

// 응답으로 내려오는 태그
export interface FriendTag {
  id: number;
  memberId?: number;
  loginId?: string;
  memberNickname?: string;
  tagText?: string;
  tagStatus: string;
}

// ui에서 사용하는 친구 태그 타입
export interface UiSelectedTag {
  // 검색 결과에서 추가할 때 받는 값들
  id?: number;          // 검색 결과의 id (== memberId로 변환 대상)
  loginId: string;      // 화면 표시용

  // 기존에 이미 저장돼 있던 태그는 memberId가 채워져 옴
  memberId?: number;    // 저장된 태그 구분용(있으면 기존 태그, 없으면 신규 태그)
}

// 콘텐츠 타입별 요청 데이터
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

// 월간 다이어리 목록 응답
export interface MonthlyDiaryResponse {
  status: number;
  message?: string;
  body: {
    data: {
      diaryList: MonthlyDiaryItem[];
    };
  };
}

// 월간 다이어리 아이템
export interface MonthlyDiaryItem {
  id: number;
  diaryDate: string;
  type: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  title: string;
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

// 다이어리 등록/수정 응답
export interface DiaryCreateResponse {
  status: number;
  message?: string;
  body: {
    data: DiaryDetail;
  };
}

// 다이어리 상세 조회 응답
export interface DiaryDetailResponse {
  id: number;
  diaryDate: string;
  diaryType: 'DAILY' | 'BOOK' | 'MOVIE';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  content: DailyContent | BookContent | MovieContent;
  diaryTags?: FriendTag[];
}

// 다이어리 상세 정보 타입 (백엔드 응답과 동일하게 camelCase 유지)
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

// 이미지 임시 업로드 응답
export interface TempImageResponse {
  status: number;
  message?: string;

    data: {
      url: string;
      fileId: string;
      expiresAt: string;
    };
}

// 다이어리 삭제 응답
export interface DiaryDeleteResponse {
  status: number;
  body: {
    data: null;
  };
}

// 친구 검색 결과 아이템
export interface FriendItem {
  id: number;
  loginId: string;
}

// 친구 검색 응답
export interface FriendSearchResponse {
  count: number;
  message: string;
  data: FriendItem[];
  status: number;
}

// 락 응답 타입
export interface LockAcquireResponse {
  acquired: boolean;
  expiresAt: string;
  token: string;
  ownerId: number;
  ttlSeconds: number;
}

export interface LockRenewResponse {
  acquired: boolean;
  expiresAt: string;
  ttlSeconds: number;
}