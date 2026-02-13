import React from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Receipt, FileText } from 'lucide-react';

interface Props {
    restaurantId: string;
    tableId: string;
}

const BottomNav: React.FC<Props> = ({ restaurantId, tableId }) => {
    const baseUrl = `/order/${restaurantId}/${tableId}`;

    const navItems = [
        { to: baseUrl, icon: UtensilsCrossed, label: 'Menu' },
        { to: `${baseUrl}/orders`, icon: Receipt, label: 'Orders' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-md mx-auto px-4">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === baseUrl}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? 'text-primary-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
                                    <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;
