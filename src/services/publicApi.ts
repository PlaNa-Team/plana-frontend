import axios from 'axios';
import { HolidayApiResponse, HolidayItem } from '../types/calendar.types';

const publicApiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공휴일 정보 가져오는 함수
export const fetchHolidays = async (year: string): Promise<HolidayItem[]> => {
  try {
    console.log('API 키 확인:', process.env.REACT_APP_HOLIDAY_API_KEY ? '있음' : '없음');
    
    const apiUrl = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo';
    const params = {
      ServiceKey: process.env.REACT_APP_HOLIDAY_API_KEY,
      solYear: year,
      numOfRows: 100,
      _type: 'json',
    };

    console.log('API 호출 URL:', apiUrl);
    console.log('API 호출 파라미터:', params);

    const response = await publicApiClient.get<HolidayApiResponse>(apiUrl, {
      params: params
    });

    console.log('API 전체 응답:', response.data);
    console.log('API 상태 코드:', response.status);

    // API 응답 구조 확인
    if (!response.data) {
      console.error('응답 데이터가 없습니다.');
      return [];
    }

    if (!response.data.response) {
      console.error('response 필드가 없습니다.');
      return [];
    }

    // 헤더 확인
    const header = response.data.response.header;
    console.log('API 헤더:', header);
    
    if (header.resultCode !== '00') {
      console.error('API 오류:', header.resultCode, header.resultMsg);
      return [];
    }

    // body 확인
    const body = response.data.response.body;
    if (!body) {
      console.log('body가 없습니다.');
      return [];
    }

    if (!body.items) {
      console.log('items가 없습니다.');
      return [];
    }

    const items = body.items.item;
    
    if (!items) {
      console.log('item이 없습니다.');
      return [];
    }

    console.log('공휴일 아이템들:', items);

    // 배열이 아닌 경우 배열로 변환
    const holidayArray = Array.isArray(items) ? items : [items];
    console.log('최종 공휴일 배열:', holidayArray);
    
    return holidayArray;
    
  } catch (error) {
    console.error('공휴일 API 호출 오류:', error);
    
    // axios 에러인 경우 더 자세한 정보 출력
    if (axios.isAxiosError(error)) {
      console.error('응답 상태:', error.response?.status);
      console.error('응답 데이터:', error.response?.data);
      console.error('요청 URL:', error.config?.url);
    }
    
    return [];
  }
};

export default publicApiClient;