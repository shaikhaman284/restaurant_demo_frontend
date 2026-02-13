import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../../store/useStore';
import apiService from '../../services/apiService';

interface Props {
    onClose: () => void;
    restaurantId: string;
    tableId: string;
}

const CartView: React.FC<Props> = ({ onClose, restaurantId, tableId }) => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
    const { customer } = useAuthStore();
    const [loading, setLoading] = React.useState(false);

    const subtotal = getTotal();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!customer) return;

        setLoading(true);
        try {
            const orderItems = items.map(item => ({
                menuItemId: item.menuItem.id,
                variationId: item.variation?.id,
                quantity: item.quantity,
                addonIds: item.addons.map(a => a.id),
                specialInstructions: item.specialInstructions,
            }));

            await apiService.post('/orders', {
                restaurantId,
                tableId,
                customerId: customer.id,
                items: orderItems,
            });

            // Clear cart and navigate to orders
            clearCart();
            navigate(`/order/${restaurantId}/${tableId}/orders`);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.menuItem.name}</h3>
                                    {item.variation && (
                                        <p className="text-sm text-gray-600">{item.variation.name}</p>
                                    )}
                                    {item.addons.length > 0 && (
                                        <p className="text-sm text-gray-600">
                                            Add-ons: {item.addons.map(a => a.name).join(', ')}
                                        </p>
                                    )}
                                    {item.specialInstructions && (
                                        <p className="text-sm text-gray-600 italic">
                                            Note: {item.specialInstructions}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeItem(item.menuItem.id, item.variation?.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1, item.variation?.id)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1, item.variation?.id)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="font-semibold">₹{item.totalPrice}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t p-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax (18% GST)</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500">(Extra charges may apply)</p>
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4">
                    <button
                        onClick={handleCheckout}
                        disabled={loading || items.length === 0}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Placing Order...' : 'Proceed to Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartView;
