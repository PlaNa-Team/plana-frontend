import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client, StompHeaders } from '@stomp/stompjs';

import { RootState } from '../store';
import { ExtendedUnifiedAlarm, addNewNotification } from '../store/slices/notiSlice'; 

// 백엔드에서 제공한 URL 구조
const WEBSOCKET_BASE_URL = "wss://plana.hoonee-math.info/api/ws"; 

export const useStompNotification = () => {
    const dispatch = useDispatch();
    
    // 💡 [수정] AuthState에 정의된 'accessToken' 속성 사용
    const accessToken = useSelector((state: RootState) => state.auth.accessToken); 
    
    // 💡 [수정] AuthState에 정의된 'user' 객체 전체 가져오기
    const user = useSelector((state: RootState) => state.auth.user);
    
    // 💡 [수정] User 타입에는 'id'가 정의되어 있으므로 'user?.id'를 사용
    const memberId = user?.id; // user?.id가 number 타입

    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        // Redux store에 토큰과 memberId가 있을 때만 연결 시도
        if (!accessToken || !memberId) { // accessToken과 memberId를 사용
            console.log("Token or Member ID is missing. Cannot establish WebSocket connection.");
            return;
        }

        // 1. 순수 WebSocket URL 생성 (accessToken을 쿼리 파라미터로 포함)
        const wsUrlWithToken = `${WEBSOCKET_BASE_URL}?token=${encodeURIComponent(accessToken)}`;
        console.log('🔌 WebSocket URL:', wsUrlWithToken);
        
        const client = new Client({
            // 2. 순수 WebSocket 팩토리 함수 사용
            webSocketFactory: () => new WebSocket(wsUrlWithToken),
            
            // STOMP 연결 시 헤더 (서버 설정에 따라 토큰을 헤더에도 포함)
            connectHeaders: {
                 'Authorization': `Bearer ${accessToken}` 
            } as StompHeaders,

            // 디버그 설정
            debug: (str) => {
                if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('MESSAGE')) {
                    console.log('🔧 STOMP DEBUG:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('✅ STOMP 연결 성공!');

            // 1. 연결 확인 메시지 전송
            client.publish({
                destination: '/app/connect',
                body: "{}",
                headers: {
                    'content-type': 'application/json',
                },
            });
            console.log('📤 세션 등록 완료: /app/connect');


            // 2. 개인 알림 채널 구독
            // 가장 표준적인 Spring 경로를 사용합니다.
            const subscriptionPath = `/user/queue/notifications`; 
            
            // 💡 [참고] memberId를 경로에 직접 사용하는 경로 (필요한 경우만 활성화)
            // const specificPath = `/user/${memberId}/notifications`; 

            // 구독 함수
            const subscribeToPath = (path: string) => {
                client.subscribe(path, (message) => {
                    console.log(`🎯 [${path}] 메시지 수신!`);
                    try {
                        const newNotification: ExtendedUnifiedAlarm = JSON.parse(message.body);
                        console.log('New notification received:', newNotification);
                        // 새 알림을 Redux 스토어에 추가
                        dispatch(addNewNotification(newNotification)); 
                    } catch (e) {
                        console.error(`Error processing message from ${path}:`, e);
                    }
                });
                 console.log(`📫 구독 완료: ${path}`);
            }

            subscribeToPath(subscriptionPath);
            // subscribeToPath(specificPath); // 필요한 경우 주석 해제

        };

        client.onStompError = (frame) => {
            console.error('❌ STOMP 연결 실패/에러:', frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
        
        // 연결 활성화
        client.activate();
        setStompClient(client);

        // 컴포넌트 언마운트 시 연결 해제
        return () => {
            if (client.active) {
                client.deactivate().then(() => {
                    console.log('Disconnected from STOMP/WebSocket');
                });
            }
        };
    }, [accessToken, memberId, dispatch]); // 의존성 배열도 accessToken과 memberId로 수정

    return { stompClient };
};