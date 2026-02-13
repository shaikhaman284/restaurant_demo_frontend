import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users } from 'lucide-react';
import apiService from '../../services/apiService';
import OrderCard from '../../components/restaurant/OrderCard';
import type { Table, Order } from '../../types';

const TableDetailPage: React.FC = () => {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const [table, setTable] = useState<Table | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [tableId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tableRes, ordersRes] = await Promise.all([
                apiService.get(`/tables/${tableId}`),
                apiService.get(`/orders/table/${tableId}`),
            ]);

            setTable(tableRes.data);

            // Map orderItems to items for consistency
            const mappedOrders = ordersRes.data.map((order: any) => ({
                ...order,
                items: order.orderItems || [],
                totalAmount: order.total || order.totalAmount,
            }));

            setOrders(mappedOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const handleGenerateBill = () => {
        const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');
        if (activeOrders.length > 0) {
            navigate(`/restaurant/billing/${activeOrders[0].id}`);
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
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/restaurant/dashboard')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Table {table?.tableNumber}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Capacity: {table?.capacity} • Status: {table?.status}
                            </p>
                        </div>
                        {table?.currentAmount && table.currentAmount > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Current Amount</p>
                                <p className="text-2xl font-bold text-primary-500">
                                    ₹{table.currentAmount}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={handleGenerateBill}
                            disabled={orders.filter((o) => o.status !== 'CANCELLED').length === 0}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileText className="w-5 h-5" />
                            Generate Bill
                        </button>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Orders ({orders.length})
                    </h2>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No orders for this table</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableDetailPage;
