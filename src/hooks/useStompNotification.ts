import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client, StompHeaders } from '@stomp/stompjs';

import { RootState } from '../store';
import { ExtendedUnifiedAlarm, addNewNotification } from '../store/slices/notiSlice'; 

// 백엔드에서 제공한 URL 구조
const WEBSOCKET_BASE_URL = "wss://plana.hoonee-math.info/api/ws"; 

export const useStompNotification = () => {
    const dispatch = useDispatch();
    
    // Auth 상태에서 필요한 정보 가져오기
    const accessToken = useSelector((state: RootState) => state.auth.accessToken); 
    const user = useSelector((state: RootState) => state.auth.user);
    const memberId = user?.id; // user?.id가 number 타입

    // stompClient 상태는 유지 (연결/해제를 위해 필요)
    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        // 1. 연결 필수 조건 확인 및 연결 정리
        if (!accessToken || !memberId) { 
            console.log('useStompNotification.ts: Token or Member ID is missing. Cannot establish WebSocket connection.');
            if (stompClient?.active) {
                // 토큰이 사라지면 기존 연결을 정리하고 상태를 초기화합니다.
                 stompClient.deactivate().then(() => {
                     console.log('useStompNotification.ts: Token removed. Disconnected from STOMP/WebSocket.');
                });
                setStompClient(null); // 상태 초기화
            }
            return;
        }

        // 2. 이미 연결되어 있다면 새로 시도하지 않고 종료 (새로 연결할 필요 없음)
        if (stompClient?.active) {
            console.log("useStompNotification.ts: STOMP client already active. Skipping connection attempt.");
            return;
        }
        
        // 3. 클라이언트 생성 및 연결 로직
        const wsUrlWithToken = `${WEBSOCKET_BASE_URL}?token=${encodeURIComponent(accessToken)}`;
        console.log('useStompNotification.ts: 🔌 WebSocket URL:', wsUrlWithToken);
        
        const client = new Client({
            webSocketFactory: () => new WebSocket(wsUrlWithToken),
            connectHeaders: {
                 'Authorization': `Bearer ${accessToken}` 
            } as StompHeaders,

            debug: (str) => {
                if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('MESSAGE')) {
                    console.log('useStompNotification.ts: 🔧 STOMP DEBUG:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('useStompNotification.ts: ✅ STOMP 연결 성공!');

            // 📢 중요: 연결 성공 시 setStompClient를 호출하여 클라이언트 상태를 저장합니다.
            // setStompClient(client); 
            // 💡 잠깐! setStompClient를 여기서 호출하지 않고, 바로 아래에서 activate 전에 호출하여 무한 루프를 막습니다.
            // setStompClient(client); // 이미 activate 전에 호출 예정

            // 1. 연결 확인 메시지 전송
            client.publish({
                destination: '/app/connect',
                body: "{}",
                headers: { 'content-type': 'application/json' },
            });
            console.log('useStompNotification.ts: 📤 세션 등록 완료: /app/connect');


            // 2. 개인 알림 채널 구독
            const subscriptionPath = `/user/queue/notifications`; 
            
            client.subscribe(subscriptionPath, (message) => {
                console.log(`useStompNotification.ts: 🎯 [${subscriptionPath}] 메시지 수신!`);
                try {
                    const newNotification: ExtendedUnifiedAlarm = JSON.parse(message.body);
                    console.log('useStompNotification.ts: New notification received:', newNotification);
                    dispatch(addNewNotification(newNotification)); 
                } catch (e) {
                    console.error(`useStompNotification.ts: Error processing message from ${subscriptionPath}:`, e);
                }
            });
            console.log(`useStompNotification.ts: 📫 구독 완료: ${subscriptionPath}`);
        };

        client.onStompError = (frame) => {
            console.error('useStompNotification.ts: ❌ STOMP 연결 실패/에러:', frame.headers['message']);
            console.error('useStompNotification.ts: Additional details: ' + frame.body);
            // setStompClient(null); // 에러 시 상태 초기화 (재연결 시도에 도움)
        };
        
        // 4. 클라이언트 활성화 직전에 상태를 저장합니다. 
        // 이렇게 하면 setStompClient 호출은 한 번만 발생합니다.
        setStompClient(client);

        // 5. 연결 활성화
        client.activate();


        // 6. 클린업 함수: 컴포넌트 언마운트 시 또는 의존성 변경 시 기존 연결 정리
        return () => {
             // 💡 [개선] 클린업 시에도 상태를 null로 초기화하여 재연결을 막습니다.
             setStompClient(null); 
            if (client.active) {
                client.deactivate().then(() => {
                    console.log('useStompNotification.ts: Disconnected from STOMP/WebSocket via cleanup');
                });
            }
        };
    // 💡 [핵심 수정] stompClient를 의존성 배열에서 제거했습니다!
    }, [accessToken, memberId, dispatch]); 

    return { stompClient };
};