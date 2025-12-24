import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);

  // Memoize event handlers to prevent recreating on every render
  const handleFriendRequest = useCallback((request) => {
    console.log('Received friend request:', request);
    addToast(`👋 ${request.fromUser.full_name} đã gửi lời mời kết bạn!`, 'info');
  }, [addToast]);

  const handleFriendRequestAccepted = useCallback((acceptor) => {
    console.log('Friend request accepted by:', acceptor);
    addToast(`✨ ${acceptor.full_name} đã chấp nhận kết bạn!`, 'success');
  }, [addToast]);

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      console.log('User logged in, initializing socket...');
      // Use environment variable, fallback to current origin for production
      const SERVER_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

      const newSocket = io(SERVER_URL, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err);
      });

      // --- Global Notifications ---
      newSocket.on('new_friend_request', handleFriendRequest);
      newSocket.on('friend_request_accepted', handleFriendRequestAccepted);

      setSocket(newSocket);

      return () => {
        console.log('Disconnecting socket...');
        newSocket.disconnect();
      };
    } else {
      // Cleanup if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, handleFriendRequest, handleFriendRequestAccepted]); // Remove socket from deps to prevent infinite loop

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
