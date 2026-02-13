import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import type { Order } from '../../types';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/orders/${orderId}`);

            // Map orderItems to items for consistency
            const mappedOrder = {
                ...response.data,
                items: response.data.orderItems || [],
                totalAmount: response.data.total || response.data.totalAmount,
                taxAmount: response.data.tax || response.data.taxAmount,
            };

            setOrder(mappedOrder);
            setLoading(false);
        } catch (error) {
            console.error('Error loading order:', error);
            setLoading(false);
        }
    };

    const handleGenerateKOT = async () => {
        try {
            await apiService.post('/kots', { orderId });
            alert('KOT generated successfully!');
            loadOrder();
        } catch (error) {
            console.error('Error generating KOT:', error);
            alert('Failed to generate KOT');
        }
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            await apiService.patch(`/orders/${orderId}/status`, { status });
            setOrder((prev) => (prev ? { ...prev, status: status as any } : null));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Order not found</p>
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
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Table {order.table?.tableNumber} • {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-primary-500">
                                ₹{order.totalAmount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Status & Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Actions</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {order.status}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {order.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => handleUpdateStatus('CONFIRMED')}
                                    className="btn-primary"
                                >
                                    <CheckCircle className="w-5 h-5 inline mr-2" />
                                    Confirm Order
                                </button>
                                <button onClick={handleGenerateKOT} className="btn-secondary">
                                    <Printer className="w-5 h-5 inline mr-2" />
                                    Generate KOT
                                </button>
                            </>
                        )}
                        {order.status === 'CONFIRMED' && (
                            <button
                                onClick={() => handleUpdateStatus('PREPARING')}
                                className="btn-primary"
                            >
                                Start Preparing
                            </button>
                        )}
                        {order.status === 'PREPARING' && (
                            <button
                                onClick={() => handleUpdateStatus('READY')}
                                className="btn-primary"
                            >
                                Mark as Ready
                            </button>
                        )}
                        {order.status === 'READY' && (
                            <button
                                onClick={() => handleUpdateStatus('SERVED')}
                                className="btn-primary"
                            >
                                Mark as Served
                            </button>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
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
                                        <p className="text-sm text-gray-500 ml-6 mt-1">
                                            {item.variation.name}
                                        </p>
                                    )}
                                    {item.addons && item.addons.length > 0 && (
                                        <p className="text-sm text-gray-500 ml-6">
                                            + {item.addons.map((a) => a.name).join(', ')}
                                        </p>
                                    )}
                                    {item.specialInstructions && (
                                        <p className="text-sm text-gray-400 ml-6 italic">
                                            Note: {item.specialInstructions}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                                    <p className="font-semibold text-gray-900">₹{item.totalPrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bill Summary */}
                    <div className="mt-6 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Tax & Charges</span>
                            <span>₹{order.taxAmount || order.tax}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* KOTs */}
                {order.kots && order.kots.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Kitchen Order Tickets
                        </h2>
                        <div className="space-y-3">
                            {order.kots.map((kot) => (
                                <div
                                    key={kot.id}
                                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">KOT #{kot.kotNumber}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(kot.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {kot.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;
