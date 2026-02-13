import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle } from 'lucide-react';
import type { Order } from '../../types';

interface Props {
    order: Order;
}

const OrderCard: React.FC<Props> = ({ order }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'CONFIRMED':
            case 'PREPARING':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'READY':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'SERVED':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-5 h-5" />;
            case 'PREPARING':
                return <ChefHat className="w-5 h-5" />;
            case 'READY':
            case 'SERVED':
                return <CheckCircle className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div
            onClick={() => navigate(`/restaurant/order/${order.id}`)}
            className="bg-white rounded-lg shadow-sm border-2 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-semibold text-gray-900">
                        Table {order.table?.tableNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                        Order #{order.orderNumber}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium">{order.status}</span>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                            {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="text-gray-600">₹{item.totalPrice}</span>
                    </div>
                ))}
                {order.items.length > 3 && (
                    <p className="text-sm text-gray-500">
                        +{order.items.length - 3} more items
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleTimeString()}
                </span>
                <span className="font-bold text-primary-500">
                    ₹{order.totalAmount}
                </span>
            </div>
        </div>
    );
};

export default OrderCard;
