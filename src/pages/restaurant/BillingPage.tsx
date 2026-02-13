import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import apiService from '../../services/apiService';
import type { Order } from '../../types';

const BillingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
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

    const handleApplyDiscount = async () => {
        try {
            const response = await apiService.post(`/billing/discount`, {
                orderId,
                discountAmount: discount,
            });
            setOrder(response.data);
            alert('Discount applied successfully!');
        } catch (error) {
            console.error('Error applying discount:', error);
            alert('Failed to apply discount');
        }
    };

    const handleProcessPayment = async () => {
        try {
            await apiService.post(`/billing/payment`, {
                orderId,
                paymentMethod,
            });
            alert('Payment processed successfully!');
            navigate('/restaurant/dashboard');
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Failed to process payment');
        }
    };

    const handlePrint = () => {
        window.print();
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

    const finalTotal = order.totalAmount - discount;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm no-print">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/restaurant/dashboard')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Generate Bill</h1>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Printer className="w-5 h-5" />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Bill Preview */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center mb-6 print-only">
                        <h2 className="text-2xl font-bold text-gray-900">Restaurant Bill</h2>
                        <p className="text-gray-600">Table {order.table?.tableNumber}</p>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-600">Bill No: {order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                            Date: {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {order.customer && (
                            <p className="text-sm text-gray-600">Customer: {order.customer.name}</p>
                        )}
                    </div>

                    {/* Items */}
                    <table className="w-full mb-6">
                        <thead className="border-b-2 border-gray-300">
                            <tr>
                                <th className="text-left py-2">Item</th>
                                <th className="text-center py-2">Qty</th>
                                <th className="text-right py-2">Price</th>
                                <th className="text-right py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="py-3">
                                        <p className="font-medium">{item.menuItem.name}</p>
                                        {item.variation && (
                                            <p className="text-sm text-gray-500">{item.variation.name}</p>
                                        )}
                                        {item.addons && item.addons.length > 0 && (
                                            <p className="text-sm text-gray-500">
                                                + {item.addons.map((a) => a.name).join(', ')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">₹{item.price}</td>
                                    <td className="text-right">₹{item.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Tax & Charges</span>
                            <span>₹{(order.taxAmount || order.tax).toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                            <span>Total</span>
                            <span>₹{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 print-only">
                        <p>Thank you for dining with us!</p>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 no-print">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>

                    {/* Discount */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apply Discount (₹)
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="input-field flex-1"
                                placeholder="Enter discount amount"
                                min="0"
                                max={order.totalAmount}
                            />
                            <button onClick={handleApplyDiscount} className="btn-secondary">
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <div className="flex gap-3">
                            {(['CASH', 'CARD', 'UPI'] as const).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${paymentMethod === method
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Process Payment */}
                    <button
                        onClick={handleProcessPayment}
                        className="w-full btn-primary text-lg py-4"
                    >
                        Process Payment - ₹{finalTotal.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
