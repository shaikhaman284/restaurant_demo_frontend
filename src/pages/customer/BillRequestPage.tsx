import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import socketService from '../../services/socketService';
import { useAuthStore } from '../../store/useStore';
import BottomNav from '../../components/customer/BottomNav';
import type { Order } from '../../types';

const BillRequestPage: React.FC = () => {
    const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
    const { customer } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [billRequested, setBillRequested] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [tableId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/orders/table/${tableId}`);
            // Filter only unpaid orders (these are the ones that need to be billed)
            const unpaidOrders = response.data.filter(
                (order: Order) => order.paymentStatus === 'UNPAID'
            );
            setOrders(unpaidOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestBill = () => {
        if (tableId) {
            socketService.emit('billRequested', { tableId });
            setBillRequested(true);
        }
    };

    const calculateSubtotal = () => {
        return orders.reduce((sum, order) => sum + order.subtotal, 0);
    };

    const calculateTax = () => {
        return orders.reduce((sum, order) => sum + (order.taxAmount || 0), 0);
    };

    const calculateTotal = () => {
        return orders.reduce((sum, order) => sum + order.totalAmount, 0);
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
                    <h1 className="text-2xl font-bold text-gray-900">Bill Summary</h1>
                    {customer && (
                        <p className="text-sm text-gray-600 mt-1">
                            {customer.name} • Table {tableId}
                        </p>
                    )}
                </div>
            </div>

            {/* Bill Content */}
            <div className="max-w-md mx-auto px-4 py-6">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No orders to bill</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Place some orders first to request the bill
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Items List */}
                        <div className="card">
                            <h2 className="font-semibold text-lg text-gray-900 mb-4">
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {orders.map((order) =>
                                    order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-start pb-3 border-b last:border-b-0"
                                        >
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
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-sm text-gray-600">x{item.quantity}</p>
                                                <p className="font-semibold text-gray-900">
                                                    ₹{item.totalPrice}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Bill Summary */}
                        <div className="card">
                            <h2 className="font-semibold text-lg text-gray-900 mb-4">
                                Bill Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax & Charges</span>
                                    <span>₹{calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="font-bold text-lg text-gray-900">Total</span>
                                    <span className="font-bold text-2xl text-primary-500">
                                        ₹{calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Request Bill Button */}
                        {billRequested ? (
                            <div className="card bg-green-50 border-green-200">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-900">
                                            Bill Requested!
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            Our staff will bring your bill shortly
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleRequestBill}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Request Bill
                            </button>
                        )}

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium">Payment at Counter</p>
                                    <p className="text-blue-700 mt-1">
                                        Please proceed to the counter for payment after receiving your
                                        bill
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            {restaurantId && tableId && (
                <BottomNav restaurantId={restaurantId} tableId={tableId} />
            )}
        </div>
    );
};

export default BillRequestPage;
