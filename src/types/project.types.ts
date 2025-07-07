// TypeScript 타입 정의 - 프로젝트 저널 관련 타입
export type ProjectStatus = '예정' | '진행' | '완료' | '중단';

export interface Project {
  id: number;
  memberId: number;
  year: number;
  title: string;
  startMonth: number;
  endMonth: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
}

export interface JournalDetailSchedule {
  id: number;
  projectId: number;
  memberId: number;
  isImportant: boolean;
  startDate: string;
  endDate: string;
  detail?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
}
