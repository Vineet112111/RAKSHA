import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../services/api';
import { useAuth } from './AuthContext';

const SOSContext = createContext();

export const SOSProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activeSOS, setActiveSOS] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null); // Coordinate stream received for contacts tracking
  const [trackingCoordinates, setTrackingCoordinates] = useState([]); // Breadcrumbs of tracked movement
  const socketRef = useRef(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  // Check for active SOS on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      checkActiveSOS();
    } else {
      disconnectSocket();
      setActiveSOS(null);
    }
    return () => disconnectSocket();
  }, [isAuthenticated]);

  // Connect socket helper
  const connectSocket = () => {
    if (socketRef.current) return socketRef.current;
    
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('[SOCKET CLIENT] Connected to server:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[SOCKET CLIENT] Disconnected from server');
    });

    return socketRef.current;
  };

  // Disconnect socket helper
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log('[SOCKET CLIENT] Socket connection closed');
    }
  };

  // Check if current user has an active SOS
  const checkActiveSOS = async () => {
    try {
      const res = await API.get('/sos/active');
      if (res.data.success && res.data.data) {
        const sosRecord = res.data.data;
        setActiveSOS(sosRecord);
        
        // Connect socket & join room automatically
        const socket = connectSocket();
        socket.emit('join-sos-room', { sosId: sosRecord.sosId });
      }
    } catch (error) {
      console.error('[SOS CONTEXT] Error checking active SOS', error);
    }
  };

  // Trigger SOS alert
  const triggerSOS = async (latitude, longitude, notes = '') => {
    try {
      const res = await API.post('/sos/trigger', { latitude, longitude, notes });
      if (res.data.success) {
        const sosRecord = res.data.data;
        setActiveSOS(sosRecord);

        // Connect socket & join room
        const socket = connectSocket();
        socket.emit('join-sos-room', { sosId: sosRecord.sosId });
        
        return { success: true, data: sosRecord };
      }
    } catch (error) {
      console.error('[SOS CONTEXT] Error triggering SOS', error);
      return { success: false, message: error.response?.data?.message || 'Failed to trigger SOS' };
    }
  };

  // Cancel SOS alert
  const cancelSOS = async (sosId) => {
    try {
      const res = await API.post(`/sos/cancel/${sosId}`);
      if (res.data.success) {
        setActiveSOS(null);
        disconnectSocket();
        return { success: true };
      }
    } catch (error) {
      console.error('[SOS CONTEXT] Error cancelling SOS', error);
      return { success: false, message: error.response?.data?.message || 'Failed to cancel SOS' };
    }
  };

  // Mark status as "I'm Safe"
  const imSafe = async (sosId) => {
    try {
      const res = await API.post(`/sos/im-safe/${sosId}`);
      if (res.data.success) {
        setActiveSOS(null);
        disconnectSocket();
        return { success: true };
      }
    } catch (error) {
      console.error('[SOS CONTEXT] Error marking safe', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update safety status' };
    }
  };

  // User emits current location via Socket
  const sendLiveLocation = (latitude, longitude, accuracy = null, speed = null) => {
    if (activeSOS && socketRef.current) {
      socketRef.current.emit('send-location', {
        sosId: activeSOS.sosId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        accuracy,
        speed,
      });
      console.log(`[SOCKET EMIT] Location sent: [${latitude}, ${longitude}]`);
    }
  };

  // Emergency contact joins room to track live SOS location
  const joinTrackingRoom = (sosId, onSOSResolved) => {
    const socket = connectSocket();
    
    // Clear previous tracking states
    setLiveLocation(null);
    setTrackingCoordinates([]);
    
    // Join room
    socket.emit('join-sos-room', { sosId });

    // Listen for live location updates from the user
    socket.on('receive-location', (coords) => {
      console.log('[SOCKET RECV] Location update received:', coords);
      setLiveLocation(coords);
      setTrackingCoordinates((prev) => [...prev, coords]);
    });

    // Listen for resolution event
    socket.on('sos-ended', (data) => {
      console.log('[SOCKET RECV] SOS resolved:', data);
      if (onSOSResolved) {
        onSOSResolved(data.status); // 'cancelled' or 'safe'
      }
      setLiveLocation(null);
      disconnectSocket();
    });
  };

  return (
    <SOSContext.Provider
      value={{
        activeSOS,
        liveLocation,
        trackingCoordinates,
        triggerSOS,
        cancelSOS,
        imSafe,
        sendLiveLocation,
        joinTrackingRoom,
        checkActiveSOS,
        disconnectSocket,
      }}
    >
      {children}
    </SOSContext.Provider>
  );
};

export const useSOS = () => useContext(SOSContext);
