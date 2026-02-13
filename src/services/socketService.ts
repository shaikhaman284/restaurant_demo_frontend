import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            this.socket.on('connect', () => {
                console.log('🔌 Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Socket disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRestaurant(restaurantId: string) {
        this.socket?.emit('join:restaurant', restaurantId);
    }

    leaveRestaurant(restaurantId: string) {
        this.socket?.emit('leave:restaurant', restaurantId);
    }

    joinTable(tableId: string) {
        this.socket?.emit('join:table', tableId);
    }

    leaveTable(tableId: string) {
        if (this.socket) {
            this.socket.emit('leaveTable', tableId);
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    onNewOrder(callback: (order: any) => void) {
        this.socket?.on('order:new', callback);
    }

    onOrderStatus(callback: (order: any) => void) {
        this.socket?.on('order:status', callback);
    }

    onTableStatus(callback: (table: any) => void) {
        this.socket?.on('table:status', callback);
    }

    onKOTStatus(callback: (kot: any) => void) {
        this.socket?.on('kot:status', callback);
    }

    onBillRequest(callback: (data: any) => void) {
        this.socket?.on('bill:request', callback);
    }

    getSocket() {
        return this.socket;
    }
}

export default new SocketService();
