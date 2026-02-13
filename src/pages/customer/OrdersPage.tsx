import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle, XCircle, Receipt } from 'lucide-react';
import apiService from '../../services/apiService';
import socketService from '../../services/socketService';
import { useAuthStore } from '../../store/useStore';
import BottomNav from '../../components/customer/BottomNav';
import type { Order, KOT } from '../../types';

const OrdersPage: React.FC = () => {
    const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
    const { customer } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        // Join table room for real-time updates
        if (tableId) {
            socketService.joinTable(tableId);
        }

        // Listen for order updates
        socketService.on('orderStatusUpdated', handleOrderUpdate);
        socketService.on('kotStatusUpdated', handleKOTUpdate);

        return () => {
            if (tableId) {
                socketService.leaveTable(tableId);
            }
            socketService.off('orderStatusUpdated', handleOrderUpdate);
            socketService.off('kotStatusUpdated', handleKOTUpdate);
        };
    }, [tableId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/orders/table/${tableId}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderUpdate = (data: { orderId: string; status: string }) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === data.orderId ? { ...order, status: data.status as any } : order
            )
        );
    };

    const handleKOTUpdate = (data: { kotId: string; status: string }) => {
        setOrders((prev) =>
            prev.map((order) => ({
                ...order,
                kots: order.kots?.map((kot) =>
                    kot.id === data.kotId ? { ...kot, status: data.status as any } : kot
                ),
            }))
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'PREPARING':
                return <ChefHat className="w-5 h-5 text-blue-500" />;
            case 'READY':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'SERVED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'CANCELLED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'PREPARING':
                return 'bg-blue-100 text-blue-800';
            case 'READY':
                return 'bg-green-100 text-green-800';
            case 'SERVED':
                return 'bg-green-200 text-green-900';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
                    {customer && (
                        <p className="text-sm text-gray-600 mt-1">
                            {customer.name} • Table {tableId}
                        </p>
                    )}
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-md mx-auto px-4 py-6 space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No orders yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Start browsing the menu to place your first order
                        </p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="card">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order #{order.id.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={
                                                        item.menuItem.dietary === 'VEG'
                                                            ? 'veg-indicator'
                                                            : 'non-veg-indicator'
                                                    }
                                                >
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${item.menuItem.dietary === 'VEG'
                                                            ? 'bg-green-600'
                                                            : 'bg-red-600'
                                                            }`}
                                                    />
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {item.menuItem.name}
                                                </span>
                                            </div>
                                            {item.variation && (
                                                <p className="text-xs text-gray-500 ml-6 mt-1">
                                                    {item.variation.name}
                                                </p>
                                            )}
                                            {item.addons && item.addons.length > 0 && (
                                                <p className="text-xs text-gray-500 ml-6">
                                                    + {item.addons.map((a) => a.name).join(', ')}
                                                </p>
                                            )}
                                            {item.specialInstructions && (
                                                <p className="text-xs text-gray-400 ml-6 italic">
                                                    Note: {item.specialInstructions}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm text-gray-600">x{item.quantity}</p>
                                            <p className="font-semibold text-gray-900">
                                                ₹{item.totalPrice}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* KOTs */}
                            {order.kots && order.kots.length > 0 && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Kitchen Order Tickets
                                    </p>
                                    <div className="space-y-2">
                                        {order.kots.map((kot: KOT) => (
                                            <div
                                                key={kot.id}
                                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ChefHat className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">
                                                        KOT #{kot.kotNumber}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                                        kot.status
                                                    )}`}
                                                >
                                                    {kot.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Total */}
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-lg text-primary-500">
                                        ₹{order.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Navigation */}
            {restaurantId && tableId && (
                <BottomNav restaurantId={restaurantId} tableId={tableId} />
            )}
        </div>
    );
};

export default OrdersPage;
