import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import apiService from '../../services/apiService';
import { useMenuStore, useCartStore, useAuthStore } from '../../store/useStore';
import type { MenuItem } from '../../types';
import OTPVerificationModal from '../../components/customer/OTPVerificationModal';
import ItemCustomizationModal from '../../components/customer/ItemCustomizationModal';
import CartView from '../../components/customer/CartView';
import BottomNav from '../../components/customer/BottomNav';

const MenuPage: React.FC = () => {
    const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
    const { categories, selectedCategory, searchQuery, dietaryFilter, setCategories, setSelectedCategory, setSearchQuery, setDietaryFilter } = useMenuStore();
    const { getItemCount } = useCartStore();
    const { customer } = useAuthStore();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [table, setTable] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        loadData();
    }, [restaurantId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load restaurant
            const restaurantRes = await apiService.get(`/restaurants/${restaurantId}`);
            setRestaurant(restaurantRes.data);

            // Load table
            const tableRes = await apiService.get(`/tables/${tableId}`);
            setTable(tableRes.data);

            // Load menu
            const menuRes = await apiService.get(`/menu/customer/${restaurantId}`);
            setCategories(menuRes.data);

            if (menuRes.data.length > 0) {
                setSelectedCategory(menuRes.data[0].id);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const handleAddToCart = (item: MenuItem) => {
        if (!customer) {
            setShowOTPModal(true);
            return;
        }

        if (item.isCustomizable) {
            setSelectedItem(item);
            setShowCustomizationModal(true);
        } else {
            // Add directly to cart
            useCartStore.getState().addItem({
                menuItem: item,
                addons: [],
                quantity: 1,
                totalPrice: item.price,
            });
        }
    };

    const filteredCategories = categories.map(category => ({
        ...category,
        menuItems: category.menuItems?.filter(item => {
            const matchesSearch = !searchQuery ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDietary = dietaryFilter === 'ALL' || item.dietary === dietaryFilter;

            return matchesSearch && matchesDietary;
        }) || []
    })).filter(category => category.menuItems.length > 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{restaurant?.name}</h1>
                            <p className="text-sm text-gray-600">Table {table?.tableNumber}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search item"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Filter Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute top-full mt-2 bg-white shadow-lg rounded-lg p-4 z-20 w-48">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dietary"
                                            checked={dietaryFilter === 'ALL'}
                                            onChange={() => setDietaryFilter('ALL')}
                                        />
                                        <span>All</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dietary"
                                            checked={dietaryFilter === 'VEG'}
                                            onChange={() => setDietaryFilter('VEG')}
                                        />
                                        <span>Veg</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dietary"
                                            checked={dietaryFilter === 'NON_VEG'}
                                            onChange={() => setDietaryFilter('NON_VEG')}
                                        />
                                        <span>Non-Veg</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-white border-b overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 px-4 py-3">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === category.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="mb-8">
                        <h2 className="text-xl font-bold mb-4">{category.name} ({category.menuItems?.length || 0})</h2>

                        <div className="space-y-4">
                            {category.menuItems?.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className={item.dietary === 'VEG' ? 'veg-indicator' : 'non-veg-indicator'}>
                                                <div className={`w-2 h-2 rounded-full ${item.dietary === 'VEG' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-primary-500 font-semibold">₹{item.price}</p>
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                        )}

                                        {item.isCustomizable && (
                                            <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                                Customisable
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Footer */}
            {getItemCount() > 0 && (
                <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full bg-primary-500 text-white py-4 rounded-lg font-semibold flex items-center justify-between px-6 hover:bg-primary-600 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            {getItemCount()} Items in cart
                        </span>
                        <span>View Cart</span>
                    </button>
                </div>
            )}

            {/* Modals */}
            {showOTPModal && (
                <OTPVerificationModal
                    onClose={() => setShowOTPModal(false)}
                    tableId={tableId!}
                />
            )}

            {showCustomizationModal && selectedItem && (
                <ItemCustomizationModal
                    item={selectedItem}
                    onClose={() => {
                        setShowCustomizationModal(false);
                        setSelectedItem(null);
                    }}
                />
            )}

            {showCart && (
                <CartView
                    onClose={() => setShowCart(false)}
                    restaurantId={restaurantId!}
                    tableId={tableId!}
                />
            )}

            {/* Bottom Navigation */}
            {restaurantId && tableId && (
                <BottomNav restaurantId={restaurantId} tableId={tableId} />
            )}
        </div>
    );
};

export default MenuPage;
