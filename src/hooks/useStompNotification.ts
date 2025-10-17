import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client, StompHeaders } from '@stomp/stompjs';

import { RootState } from '../store';
import { ExtendedUnifiedAlarm, addNewNotification } from '../store/slices/notiSlice'; 
// UnifiedAlarm 타입의 위치에 따라 타입을 명시적으로 import합니다.
// 타입 위치가 변경되었다면 아래 줄의 주석을 해제하고 경로를 확인해주세요.
// import { UnifiedAlarm } from '../../types/Notification.types'; 


const WEBSOCKET_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:8080/api/ws"
    : "wss://plana.hoonee-math.info/api/ws";

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
                // 토큰이 사라지면 기존 연결을 정리합니다.
                 stompClient.deactivate().then(() => {
                     console.log('useStompNotification.ts: Token removed. Disconnected from STOMP/WebSocket.');
                 });
            }
             // 💡 [개선] 토큰이 없거나 사라지면 상태를 null로 초기화하여 재로그인 시 연결을 유도합니다.
             setStompClient(null); 
            return;
        }

        // 이미 연결이 활성화되어 있으면 새 연결 시도 방지
        if (stompClient && stompClient.active) {
             console.log('useStompNotification.ts: STOMP Client already active, skipping connection.');
             return;
        }
        
        // 💡 [수정] 개인 알림 채널 구독 경로 정의 (memberId를 포함)
        // 백엔드 구조에 따라 /topic/alarm/{memberId} 경로를 사용한다고 가정합니다.
        const subscriptionPath = `/user/${memberId}/queue/notifications`;
        console.log(`useStompNotification.ts: 🔔 구독 시도 경로: ${subscriptionPath}`); 

        // 🚨 [핵심 수정] 2. brokerURL에 쿼리 파라미터만 사용하고 webSocketFactory를 제거합니다.
        // `@stomp/stompjs`가 이 URL로 웹소켓을 생성하도록 맡기고, CONNECT 프레임에는 헤더를 넣지 않습니다.
        const wsUrlWithToken = `${WEBSOCKET_BASE_URL}?access_token=${accessToken}`;
        console.log('useStompNotification.ts: 🔌 WebSocket URL (Query Auth):', wsUrlWithToken);
        
        const client = new Client({
            // brokerURL만 사용하여 라이브러리에게 웹소켓 생성과 관리를 맡깁니다.
            brokerURL: wsUrlWithToken, 
            
            // 🚨 [수정] connectHeaders를 비워서 STOMP CONNECT 프레임 인증을 건너뜁니다.
            // 백엔드가 Handshake(URL 쿼리) 인증 후 STOMP 세션을 유지한다고 가정합니다.
            connectHeaders: {} as StompHeaders, 

            debug: (str) => {
                // CONNECT, ERROR, MESSAGE와 관련된 로그만 출력
                if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('MESSAGE') || str.includes('STOMP')) {
                    console.log('useStompNotification.ts: 🔧 STOMP DEBUG:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('useStompNotification.ts: ✅ STOMP 연결 성공!');

            // 1. 연결 확인 메시지 전송 (세션 등록)
            client.publish({
                destination: '/app/connect',
                body: "{}",
                headers: { 'content-type': 'application/json' },
            });
            console.log('useStompNotification.ts: 📤 세션 등록 완료: /app/connect');


            // 2. 개인 알림 채널 구독 (💡 memberId를 경로에 직접 포함)
            client.subscribe(subscriptionPath, (message) => { 
            // 🚨 [필수] 서버에서 메시지가 왔을 때, 이 로그가 찍히는지 확인해야 합니다.
            console.log(`useStompNotification.ts: 🎯 메시지 수신!`); 
            
            if (!message.body) return; // 메시지 바디가 없으면 중단

            try {
                // 1. 받은 메시지 원본을 콘솔에 찍어봅니다.
                console.log('STOMP: Received message body:', message.body); 

                // 2. 메시지 파싱 및 타입 변환
                const rawNotification = JSON.parse(message.body);
                // 🚨 TEST 메시지 필터링
                if (rawNotification.type === "TEST" || rawNotification.type === "MANUAL_TEST") {
                console.log("테스트 메시지는 Redux 반영 안 함");
                return;
                }

                let newNotification: ExtendedUnifiedAlarm = rawNotification as ExtendedUnifiedAlarm;
                newNotification.readAt = null;
                
                // 3. Redux 디스패치
                dispatch(addNewNotification(newNotification)); 
                
                console.log('STOMP: ✅ addNewNotification 디스패치 완료!'); 

            } catch (e) { 
                // 🚨 JSON 파싱 에러 등 치명적인 에러가 여기서 잡힙니다.
                console.error(`useStompNotification.ts: ❌ FATAL Error processing message:`, e);
            }
        });
            console.log(`useStompNotification.ts: 📫 구독 완료: ${subscriptionPath}`); // 구독 완료 로그
        };

        client.onStompError = (frame) => {
            console.error('useStompNotification.ts: ❌ STOMP 연결 실패/에러:', frame.headers['message']);
            console.error('useStompNotification.ts: Additional details: ' + frame.body);
            // 에러 시 상태를 null로 초기화하여 재연결을 시도합니다.
            setStompClient(null); 
        };
        
        // 4. 클라이언트 활성화 직전에 상태를 저장합니다. 
        setStompClient(client);

        // 5. 연결 활성화
        client.activate();


        // 6. 클린업 함수: 컴포넌트 언마운트 시 또는 의존성 변경 시 기존 연결 정리
        return () => {
             // 💡 [개선] 클린업 시점에 클라이언트가 활성화되어 있으면 비활성화합니다.
             if (client.active) {
                client.deactivate().then(() => {
                    console.log('useStompNotification.ts: 🔗 Disconnected from STOMP/WebSocket via cleanup');
                });
            }
             // 💡 [개선] 클린업 시 상태를 null로 초기화하여 다음 useEffect 실행 시 재연결을 보장합니다.
             setStompClient(null); 
        };
    }, [accessToken, memberId, dispatch]); 

    return { stompClient };
};