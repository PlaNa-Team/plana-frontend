import axios from 'axios';
import { HolidayApiResponse, HolidayItem } from '../types/calendar.types';

const publicApiClient = axios.create({
  baseURL: 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공휴일 정보 가져오는 함수
export const fetchHolidays = async (year: string): Promise<HolidayItem[]> => {
  const response = await publicApiClient.get<HolidayApiResponse>(
    '/getHoliDeInfo',
    {
      params: {
        ServiceKey: process.env.REACT_APP_HOLIDAY_API_KEY,
        solYear: year,
        numOfRows: 100,
        _type: 'json',
      },
    }
  );

  const items = response.data.response.body.items.item;
  return Array.isArray(items) ? items : [items];
};

export default publicApiClient;
