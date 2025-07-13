import axios from 'axios';
import { HolidayApiResponse, HolidayItem } from '../types/calendar.types';

const publicApiClient = axios.create({
  timeout: 10000,
});

// 공휴일 정보 가져오는 함수
export const fetchHolidays = async (year: string): Promise<HolidayItem[]> => {
  try {
    const serviceKey = process.env.REACT_APP_HOLIDAY_API_KEY;
    console.log('API 키 존재 여부:', serviceKey ? '있음' : '없음');
    console.log('API 키 길이:', serviceKey?.length);
    
    if (!serviceKey) {
      console.error('API 키가 설정되지 않았습니다.');
      return [];
    }

    console.log(`${year}년 공휴일 API 호출 시작`);
    
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

    console.log(`${year}년 응답 상태:`, response.status);
    console.log(`${year}년 응답 타입:`, typeof response.data);

    // 문자열 응답인 경우 (여전히 오류)
    if (typeof response.data === 'string') {
      console.error(`${year}년 API 오류:`, response.data);
      return [];
    }

    // 정상 JSON 응답 처리
    if (!response.data?.response) {
      console.log(`${year}년: response 필드 없음`);
      return [];
    }

    const header = response.data.response.header;
    if (header?.resultCode !== '00') {
      console.error(`${year}년 API 오류:`, header);
      return [];
    }

    const body = response.data.response.body;
    if (!body) {
      console.log(`${year}년: body 없음`);
      return [];
    }

    if (body.totalCount === 0) {
      console.log(`${year}년: 공휴일 0개`);
      return [];
    }

    const items = body.items?.item;
    if (!items) {
      console.log(`${year}년: items 없음`);
      return [];
    }

    const holidayArray = Array.isArray(items) ? items : [items];
    console.log(`🎉 ${year}년 공휴일: ${holidayArray.length}개 성공!`, holidayArray);
    
    return holidayArray;
    
  } catch (error) {
    console.error(`${year}년 공휴일 API 호출 실패:`, error);
    return [];
  }
};

export default publicApiClient;