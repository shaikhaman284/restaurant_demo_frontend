import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import apiService from '../../services/apiService';
import { useAuthStore } from '../../store/useStore';
import type { Category, MenuItem, ItemVariation, ItemAddon } from '../../types';

const MenuManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/restaurant/login');
            return;
        }
        loadMenu();
    }, [user]);

    const loadMenu = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/menu/restaurant/${user?.restaurantId}`);
            setCategories(response.data);
            if (response.data.length > 0) {
                setSelectedCategory(response.data[0].id);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading menu:', error);
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setShowItemModal(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setShowItemModal(true);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await apiService.delete(`/menu/items/${itemId}`);
            loadMenu();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item');
        }
    };

    const currentCategory = categories.find((c) => c.id === selectedCategory);

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
                    <button
                        onClick={() => navigate('/restaurant/dashboard')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your menu categories and items
                            </p>
                        </div>
                        <button
                            onClick={handleAddCategory}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Category
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedCategory === category.id
                                                ? 'bg-primary-50 border-2 border-primary-500'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <span className="font-medium text-gray-900">
                                            {category.name}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCategory(category);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {currentCategory?.name} Items
                                </h2>
                                <button
                                    onClick={handleAddItem}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Item
                                </button>
                            </div>

                            {currentCategory?.menuItems && currentCategory.menuItems.length > 0 ? (
                                <div className="space-y-4">
                                    {currentCategory.menuItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div
                                                            className={
                                                                item.dietary === 'VEG'
                                                                    ? 'veg-indicator'
                                                                    : 'non-veg-indicator'
                                                            }
                                                        >
                                                            <div
                                                                className={`w-2 h-2 rounded-full ${item.dietary === 'VEG'
                                                                        ? 'bg-green-600'
                                                                        : 'bg-red-600'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {item.name}
                                                        </h3>
                                                        <span className="text-lg font-bold text-primary-500">
                                                            ₹{item.price}
                                                        </span>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        {item.isCustomizable && (
                                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                                                Customizable
                                                            </span>
                                                        )}
                                                        {!item.isActive && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No items in this category</p>
                                    <button
                                        onClick={handleAddItem}
                                        className="mt-4 text-primary-500 hover:text-primary-600"
                                    >
                                        Add your first item
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <CategoryModal
                    category={editingCategory}
                    restaurantId={user?.restaurantId!}
                    onClose={() => {
                        setShowCategoryModal(false);
                        setEditingCategory(null);
                    }}
                    onSave={() => {
                        setShowCategoryModal(false);
                        setEditingCategory(null);
                        loadMenu();
                    }}
                />
            )}

            {/* Item Modal */}
            {showItemModal && (
                <ItemModal
                    item={editingItem}
                    categoryId={selectedCategory!}
                    restaurantId={user?.restaurantId!}
                    onClose={() => {
                        setShowItemModal(false);
                        setEditingItem(null);
                    }}
                    onSave={() => {
                        setShowItemModal(false);
                        setEditingItem(null);
                        loadMenu();
                    }}
                />
            )}
        </div>
    );
};

// Category Modal Component
const CategoryModal: React.FC<{
    category: Category | null;
    restaurantId: string;
    onClose: () => void;
    onSave: () => void;
}> = ({ category, restaurantId, onClose, onSave }) => {
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || '');
    const [isActive, setIsActive] = useState(category?.isActive ?? true);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (category) {
                await apiService.patch(`/menu/categories/${category.id}`, {
                    name,
                    icon,
                    isActive,
                });
            } else {
                await apiService.post('/menu/categories', {
                    restaurantId,
                    name,
                    icon,
                    isActive,
                });
            }
            onSave();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {category ? 'Edit Category' : 'Add Category'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon (emoji)
                        </label>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="input-field w-full"
                            placeholder="🍕"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="categoryActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="categoryActive" className="text-sm text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 btn-primary disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Item Modal Component
const ItemModal: React.FC<{
    item: MenuItem | null;
    categoryId: string;
    restaurantId: string;
    onClose: () => void;
    onSave: () => void;
}> = ({ item, categoryId, restaurantId, onClose, onSave }) => {
    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    const [price, setPrice] = useState(item?.price || 0);
    const [dietary, setDietary] = useState<'VEG' | 'NON_VEG' | 'VEGAN'>(
        item?.dietary || 'VEG'
    );
    const [isCustomizable, setIsCustomizable] = useState(item?.isCustomizable || false);
    const [isActive, setIsActive] = useState(item?.isActive ?? true);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (item) {
                await apiService.patch(`/menu/items/${item.id}`, {
                    name,
                    description,
                    price: Number(price),
                    dietary,
                    isCustomizable,
                    isActive,
                });
            } else {
                await apiService.post('/menu/items', {
                    restaurantId,
                    categoryId,
                    name,
                    description,
                    price: Number(price),
                    dietary,
                    isCustomizable,
                    isActive,
                });
            }
            onSave();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {item ? 'Edit Item' : 'Add Item'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field w-full"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field w-full"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (₹) *
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="input-field w-full"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dietary Type *
                            </label>
                            <select
                                value={dietary}
                                onChange={(e) => setDietary(e.target.value as any)}
                                className="input-field w-full"
                                required
                            >
                                <option value="VEG">Vegetarian</option>
                                <option value="NON_VEG">Non-Vegetarian</option>
                                <option value="VEGAN">Vegan</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="itemCustomizable"
                                checked={isCustomizable}
                                onChange={(e) => setIsCustomizable(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="itemCustomizable" className="text-sm text-gray-700">
                                Customizable
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="itemActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="itemActive" className="text-sm text-gray-700">
                                Active
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 btn-primary disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuManagementPage;
