import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [processingUpdates, setProcessingUpdates] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');

            // Connect to Socket.io
            const newSocket = io('http://localhost:5000', {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('🔌 Socket connected:', newSocket.id);
                setConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('🔌 Socket disconnected:', reason);
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                setConnected(false);
            });

            // Processing events
            newSocket.on('processing_start', (data) => {
                console.log('📹 Processing started:', data);
                setProcessingUpdates(prev => ({
                    ...prev,
                    [data.videoId]: { ...data, type: 'start' }
                }));
            });

            newSocket.on('processing_progress', (data) => {
                console.log('📊 Processing progress:', data);
                setProcessingUpdates(prev => ({
                    ...prev,
                    [data.videoId]: { ...data, type: 'progress' }
                }));
            });

            newSocket.on('processing_complete', (data) => {
                console.log('✅ Processing complete:', data);
                setProcessingUpdates(prev => ({
                    ...prev,
                    [data.videoId]: { ...data, type: 'complete' }
                }));
            });

            newSocket.on('processing_error', (data) => {
                console.log('❌ Processing error:', data);
                setProcessingUpdates(prev => ({
                    ...prev,
                    [data.videoId]: { ...data, type: 'error' }
                }));
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            // Disconnect socket when user logs out
            if (socket) {
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [user]);

    // Get processing update for a specific video
    const getProcessingUpdate = (videoId) => {
        return processingUpdates[videoId] || null;
    };

    // Clear processing update for a video
    const clearProcessingUpdate = (videoId) => {
        setProcessingUpdates(prev => {
            const newUpdates = { ...prev };
            delete newUpdates[videoId];
            return newUpdates;
        });
    };

    // Join a video room (for future features)
    const joinVideoRoom = (videoId) => {
        if (socket && connected) {
            socket.emit('join_video', videoId);
        }
    };

    // Leave a video room
    const leaveVideoRoom = (videoId) => {
        if (socket && connected) {
            socket.emit('leave_video', videoId);
        }
    };

    const value = {
        socket,
        connected,
        processingUpdates,
        getProcessingUpdate,
        clearProcessingUpdate,
        joinVideoRoom,
        leaveVideoRoom
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
