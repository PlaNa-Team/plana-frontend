import axios from 'axios';
import {
    MonthlyDiaryResponse,
    DiaryDetailResponse,
    TempImageResponse,
    CreateDiaryRequest,
    UpdateDiaryRequest,
    DiaryCreateResponse,
    DiaryDeleteResponse
  } from '../types/diary.types';
import { upload } from '@testing-library/user-event/dist/upload';
import { create } from 'domain';

  // Axios 인스턴스 생성
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 설정 (에러 처리)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API 요청 에러:', error);
        return Promise.reject(error);
    }
);

export const diaryApi = {
    // 월간 다이어리 조회
    getMonthlyDiaries: async (year: number, month: number): Promise<MonthlyDiaryResponse> => {
        const response = await api.get(`/diaries`, {
            params: { year, month }
        });
        return response.data;
    },

    // 다이어리 상세 조회
    getDiaryDetail: async (id: number): Promise<DiaryDetailResponse> => {
        const response = await api.get(`/diaries/${id}`);
        return response.data;
    },

    // 이미지 업로드
    uploadTempImage: async (file: File): Promise<TempImageResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/files/temp-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // 다이어리 등록
    createDiary: async (data: CreateDiaryRequest): Promise<DiaryCreateResponse> => {
        const response = await api.post('/diaries', data);
        return response.data;
    },

    // 다이어리 수정
    updateDiary: async (id: number, data: UpdateDiaryRequest): Promise<DiaryCreateResponse> => {
        const response = await api.put(`/diaries/${id}`, data);
        return response.data;
    },

    // 다이어리 삭제
    deleteDiary: async (id: number): Promise<DiaryDeleteResponse> => {
        const response = await api.delete(`/diaries/${id}`);
        return response.data;
    },
};

export default diaryApi;