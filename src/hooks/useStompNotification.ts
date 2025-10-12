// src/hooks/useStompNotification.ts

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client, StompHeaders } from '@stomp/stompjs';
// SockJS 대신 WebSocket을 직접 사용합니다.
// import SockJS from 'sockjs-client'; 

import { RootState } from '../store';
import { ExtendedUnifiedAlarm, addNewNotification } from '../store/slices/notiSlice'; 

// 백엔드에서 제공한 URL 구조
// 주의: {token}은 코드 내에서 동적으로 추가할 것입니다.
const WEBSOCKET_BASE_URL = "wss://plana.hoonee-math.info/api/ws"; 

export const useStompNotification = () => {
    const dispatch = useDispatch();
    // Redux에서 accessToken을 가져옵니다. (state.auth.token이라고 가정)
    const token = useSelector((state: RootState) => state.auth.token); 
    const user = useSelector((state: RootState) => state.auth.user);
    const memberId = user?.memberId; // 로그인된 사용자의 ID를 가져옵니다.

    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        // Redux store에 토큰과 memberId가 있을 때만 연결 시도
        if (!token || !memberId) {
            console.log("Token or Member ID is missing. Cannot establish WebSocket connection.");
            return;
        }

        // 1. 순수 WebSocket URL 생성 (토큰을 쿼리 파라미터로 포함)
        const wsUrlWithToken = `${WEBSOCKET_BASE_URL}?token=${encodeURIComponent(token)}`;
        console.log('🔌 WebSocket URL:', wsUrlWithToken);
        
        const client = new Client({
            // 2. 순수 WebSocket 팩토리 함수 사용
            webSocketFactory: () => new WebSocket(wsUrlWithToken),
            
            // STOMP 연결 시 헤더 (토큰을 URL로 넘기므로, 헤더에는 Authorization을 넣어줄 필요는 없을 수 있으나, 안전을 위해 넣어둡니다.)
            connectHeaders: {
                 // 토큰을 쿼리 파라미터로 넘기므로, 이 헤더는 서버 설정에 따라 불필요할 수 있음
                 'Authorization': `Bearer ${token}` 
            } as StompHeaders,

            // 디버그 설정 (스크립트와 동일하게 중요한 로그만 표시)
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

            // 1. 연결 확인 메시지 전송 (스크립트와 동일한 로직)
            // URL: /app/connect
            client.publish({
                destination: '/app/connect',
                body: "{}", // 스크립트와 동일하게 {} 전송
                headers: {
                    'content-type': 'application/json',
                },
            });
            console.log('📤 세션 등록 완료: /app/connect');


            // 2. 개인 알림 채널 구독 (스크립트의 유력한 경로 중 하나 선택)
            // URL: /user/{memberId}/notifications 또는 /user/queue/notifications
            // Spring Boot에서 /user/queue/... 가 표준이므로, 우선 이 두 가지를 구독해봅니다.
            const subscriptionPath = `/user/queue/notifications`; 
            const specificPath = `/user/${memberId}/notifications`; 

            // 구독 함수
            const subscribeToPath = (path: string) => {
                client.subscribe(path, (message) => {
                    console.log(`🎯 [${path}] 메시지 수신!`);
                    try {
                        // 백엔드에서 받은 알림 메시지 파싱
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

            // 두 경로를 동시에 구독하여 어떤 경로가 작동하는지 확인합니다.
            subscribeToPath(subscriptionPath);
            // subscribeToPath(specificPath); // 필요한 경우 추가 구독

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
                // 클라이언트 상태를 확인하고 연결 해제
                client.deactivate().then(() => {
                    console.log('Disconnected from STOMP/WebSocket');
                });
            }
        };
    }, [token, memberId, dispatch]);

    // 외부에서 STOMP 클라이언트 상태를 필요로 할 경우 반환할 수 있습니다.
    return { stompClient };
};