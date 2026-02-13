import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Users, DollarSign, Clock } from 'lucide-react';
import apiService from '../../services/apiService';
import socketService from '../../services/socketService';
import { useAuthStore, useTableStore } from '../../store/useStore';
import OrderCard from '../../components/restaurant/OrderCard';
import Toast from '../../components/common/Toast';
import type { Order } from '../../types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { tables, setTables } = useTableStore();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeTables: 0,
        todayRevenue: 0,
    });

    useEffect(() => {
        if (!user) {
            navigate('/restaurant/login');
            return;
        }

        loadData();
        socketService.connect();
        socketService.joinRestaurant(user.restaurantId);

        // Listen for real-time updates
        socketService.on('newOrder', handleNewOrder);
        socketService.on('orderStatusUpdated', handleOrderUpdate);
        socketService.on('tableStatusUpdated', handleTableUpdate);
        socketService.on('billRequested', handleBillRequest);

        return () => {
            if (user) {
                socketService.leaveRestaurant(user.restaurantId);
            }
            socketService.off('newOrder');
            socketService.off('orderStatusUpdated');
            socketService.off('tableStatusUpdated');
            socketService.off('billRequested');
        };
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load tables
            const tablesRes = await apiService.get(`/tables/restaurant/${user?.restaurantId}`);
            setTables(tablesRes.data);

            // Load active orders (unpaid only)
            const ordersRes = await apiService.get(`/orders/restaurant/${user?.restaurantId}/active`);
            setActiveOrders(ordersRes.data);

            // Load analytics/stats
            const analyticsRes = await apiService.get(`/analytics/restaurant/${user?.restaurantId}`);
            setStats(analyticsRes.data);

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const handleNewOrder = (order: Order) => {
        setActiveOrders((prev) => [order, ...prev]);
        setToast({ message: `New order from Table ${order.table?.tableNumber}!`, type: 'info' });
        loadData(); // Refresh to update stats
    };

    const handleOrderUpdate = (data: { orderId: string; status: string }) => {
        setActiveOrders((prev) =>
            prev.map((order) =>
                order.id === data.orderId ? { ...order, status: data.status as any } : order
            )
        );
    };

    const handleTableUpdate = () => {
        loadData(); // Refresh tables
    };

    const handleBillRequest = (data: { tableId: string }) => {
        const table = tables.find((t) => t.id === data.tableId);
        setToast({ message: `Bill requested for Table ${table?.tableNumber}!`, type: 'info' });
    };

    const handleLogout = () => {
        logout();
        navigate('/restaurant/login');
    };

    const getTableStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-white border-gray-200';
            case 'OCCUPIED':
                return 'bg-blue-50 border-blue-300';
            case 'RESERVED':
                return 'bg-yellow-50 border-yellow-300';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user?.restaurant.name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {user?.name} • {user?.role}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/restaurant/tables')}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Tables
                            </button>
                            <button
                                onClick={() => navigate('/restaurant/menu')}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Menu Management
                            </button>
                            <button
                                onClick={() => navigate('/restaurant/history')}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                History
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Orders</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {stats.totalOrders}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Tables</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {stats.activeTables}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Users className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Today's Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    ₹{stats.todayRevenue.toFixed(0)}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <DollarSign className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tables Grid */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Tables</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {tables.map((table) => (
                                    <div
                                        key={table.id}
                                        onClick={() => navigate(`/restaurant/table/${table.id}`)}
                                        className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${getTableStatusColor(
                                            table.status
                                        )}`}
                                    >
                                        <div className="text-center">
                                            <p className="font-bold text-lg text-gray-900">
                                                {table.tableNumber}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {table.status}
                                            </p>
                                            {table.currentAmount > 0 && (
                                                <p className="text-sm font-semibold text-primary-500 mt-2">
                                                    ₹{table.currentAmount}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Orders */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Active Orders</h2>
                                <Bell className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {activeOrders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No active orders</p>
                                ) : (
                                    activeOrders.map((order) => (
                                        <OrderCard key={order.id} order={order} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
