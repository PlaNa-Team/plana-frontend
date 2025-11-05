import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client, StompHeaders } from '@stomp/stompjs';
import { RootState } from '../store';
import { ExtendedUnifiedAlarm, addNewNotification } from '../store/slices/notiSlice';

const WEBSOCKET_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:8080/api/ws"
    : "wss://plana.hoonee-math.info/api/ws";

export const useStompNotification = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const memberId = user?.id;

  const [stompClient, setStompClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!accessToken || !memberId) {
      if (stompClient?.active) {
        stompClient.deactivate().then(() => {
          console.log('Disconnected from STOMP/WebSocket (no token)');
        });
      }
      setStompClient(null);
      return;
    }

    if (stompClient && stompClient.active) return;

    const subscriptionPath = `/user/${memberId}/queue/notifications`;
    const wsUrlWithToken = `${WEBSOCKET_BASE_URL}?access_token=${accessToken}`;

    const client = new Client({
      brokerURL: wsUrlWithToken,
      connectHeaders: {} as StompHeaders,
      debug: (str) => {
        if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('MESSAGE')) {
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('STOMP 연결 성공');
      client.publish({
        destination: '/app/connect',
        body: "{}",
        headers: { 'content-type': 'application/json' },
      });

      client.subscribe(subscriptionPath, (message) => {
        if (!message.body) return;
        try {
          const rawNotification = JSON.parse(message.body);
          if (rawNotification.type === "TEST" || rawNotification.type === "MANUAL_TEST") return;

          const newNotification: ExtendedUnifiedAlarm = {
            ...rawNotification,
            readAt: null,
          };

          dispatch(addNewNotification(newNotification));
        } catch (e) {
          console.error('STOMP 메시지 처리 오류:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP 에러:', frame.headers['message']);
      setStompClient(null);
    };

    setStompClient(client);
    client.activate();

    return () => {
      if (client.active) {
        client.deactivate().then(() => {
          console.log('STOMP 연결 종료 (cleanup)');
        });
      }
      setStompClient(null);
    };
  }, [accessToken, memberId, dispatch]);

  return { stompClient };
};
