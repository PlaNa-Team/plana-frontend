import axios from 'axios';
import { HolidayApiResponse, HolidayItem } from '../types/calendar.types';

const publicApiClient = axios.create({
  timeout: 10000,
});

// 공휴일 정보 가져오는 함수
export const fetchHolidays = async (year: string): Promise<HolidayItem[]> => {
  try {
    const serviceKey = process.env.REACT_APP_HOLIDAY_API_KEY;
    
    if (!serviceKey) {
      console.error('공공데이터 API 호출 응답 상태: API 키 미설정');
      return [];
    }

    const response = await publicApiClient.get<HolidayApiResponse>(
      'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo',
      {
        params: {
          ServiceKey: serviceKey,
          solYear: year,
          numOfRows: 100,
          _type: 'json',
        },
      }
    );

    // 문자열 응답인 경우 (API 오류)
    if (typeof response.data === 'string') {
      console.error('공공데이터 API 호출 응답 상태: API 키 인증 오류');
      return [];
    }

    // 정상 JSON 응답 처리
    if (!response.data?.response) {
      console.error('공공데이터 API 호출 응답 상태: 응답 구조 오류');
      return [];
    }

    const header = response.data.response.header;
    if (header?.resultCode !== '00') {
      console.error(`공공데이터 API 호출 응답 상태: ${header?.resultCode}`);
      return [];
    }

    const body = response.data.response.body;
    if (!body || body.totalCount === 0) {
      console.log(`${year}년 공휴일 데이터 확인완료`);
      return [];
    }

    const items = body.items?.item;
    if (!items) {
      console.log(`${year}년 공휴일 데이터 확인완료`);
      return [];
    }

    const holidayArray = Array.isArray(items) ? items : [items];
    console.log(`${year}년 공휴일 데이터 확인완료`);
    
    return holidayArray;
    
  } catch (error) {
    console.error('공공데이터 API 호출 응답 상태: 네트워크 오류');
    return [];
  }
};

export default publicApiClient;