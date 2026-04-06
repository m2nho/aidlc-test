import { useEffect, useRef, useCallback } from 'react';
import { useAdminApp } from '../contexts/AdminAppContext';
import { api } from '../services/apiClient';
import { OrdersResponse } from '../services/types';

interface UseSSEOptions {
  url: string;
  maxReconnectAttempts?: number;
}

/**
 * Custom hook for managing SSE connection with Exponential Backoff reconnection
 *
 * Features:
 * - Automatic reconnection with Exponential Backoff (1s, 2s, 4s, 8s, 16s)
 * - Full data sync on reconnect (GET /api/orders)
 * - Max 5 reconnection attempts
 * - Automatic cleanup on unmount
 */
export function useSSE({ url, maxReconnectAttempts = 5 }: UseSSEOptions) {
  const { state, dispatch } = useAdminApp();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const wasPreviouslyConnectedRef = useRef(false);

  // Full data sync function
  const syncAllOrders = useCallback(async () => {
    try {
      dispatch({ type: 'ORDERS_FETCH_START' });
      const response = await api.get<OrdersResponse>('/api/admin/orders');
      dispatch({
        type: 'ORDERS_FETCH_SUCCESS',
        payload: { orders: response.orders },
      });
    } catch (error) {
      console.error('Failed to sync orders:', error);
      dispatch({
        type: 'ORDERS_FETCH_FAILURE',
        payload: { error: 'Failed to sync orders' },
      });
    }
  }, [dispatch]);

  // Connect to SSE
  const connect = useCallback(() => {
    // Don't connect if not authenticated
    if (!state.auth.isAuthenticated) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;

      // Connection opened
      eventSource.addEventListener('open', () => {
        console.log('SSE connected');
        dispatch({ type: 'SSE_CONNECTED' });
        reconnectAttemptsRef.current = 0;

        // Full data sync on reconnect (skip on first connection)
        if (wasPreviouslyConnectedRef.current) {
          console.log('Syncing data after reconnect');
          syncAllOrders();
        }
        wasPreviouslyConnectedRef.current = true;
      });

      // Order created event
      eventSource.addEventListener('order.created', (event: MessageEvent) => {
        console.log('SSE: order.created', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.order) {
            dispatch({ type: 'ORDER_ADD', payload: { order: data.order } });
          }
        } catch (error) {
          console.error('Failed to parse order.created event:', error);
        }
      });

      // Order updated event
      eventSource.addEventListener('order.updated', (event: MessageEvent) => {
        console.log('SSE: order.updated', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.order) {
            dispatch({ type: 'ORDER_UPDATE', payload: { order: data.order } });
          }
        } catch (error) {
          console.error('Failed to parse order.updated event:', error);
        }
      });

      // Order deleted event
      eventSource.addEventListener('order.deleted', (event: MessageEvent) => {
        console.log('SSE: order.deleted', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.orderId) {
            dispatch({
              type: 'ORDER_DELETE',
              payload: { orderId: data.orderId },
            });
          }
        } catch (error) {
          console.error('Failed to parse order.deleted event:', error);
        }
      });

      // Connection error
      eventSource.addEventListener('error', () => {
        console.error('SSE connection error');
        dispatch({ type: 'SSE_DISCONNECTED' });
        eventSource.close();

        // Attempt reconnection with Exponential Backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          reconnectAttemptsRef.current += 1;

          dispatch({
            type: 'SSE_RECONNECT_ATTEMPT',
            payload: { attempts: reconnectAttemptsRef.current },
          });

          console.log(
            `SSE reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('SSE max reconnection attempts reached');
          dispatch({
            type: 'SSE_ERROR',
            payload: { error: 'Max reconnection attempts reached' },
          });
        }
      });
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      dispatch({
        type: 'SSE_ERROR',
        payload: { error: 'Failed to create SSE connection' },
      });
    }
  }, [url, state.auth.isAuthenticated, dispatch, maxReconnectAttempts, syncAllOrders]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    dispatch({ type: 'SSE_RECONNECT_RESET' });
    connect();
  }, [connect, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  // Connect when authenticated
  useEffect(() => {
    if (state.auth.isAuthenticated) {
      connect();
    } else {
      // Disconnect when not authenticated
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      wasPreviouslyConnectedRef.current = false;
    }
  }, [state.auth.isAuthenticated, connect]);

  return {
    isConnected: state.sse.isConnected,
    error: state.sse.error,
    reconnectAttempts: state.sse.reconnectAttempts,
    reconnect,
  };
}
