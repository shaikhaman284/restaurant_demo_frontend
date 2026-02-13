import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/useStore';
import type { MenuItem, ItemVariation, ItemAddon } from '../../types';

interface Props {
    item: MenuItem;
    onClose: () => void;
}

const ItemCustomizationModal: React.FC<Props> = ({ item, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariation, setSelectedVariation] = useState<ItemVariation | undefined>(
        item.variations?.[0]
    );
    const [selectedAddons, setSelectedAddons] = useState<ItemAddon[]>([]);
    const [specialInstructions, setSpecialInstructions] = useState('');

    const { addItem } = useCartStore();

    const calculatePrice = () => {
        const basePrice = selectedVariation?.price || item.price;
        const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        return (basePrice + addonsPrice) * quantity;
    };

    const handleAddToCart = () => {
        addItem({
            menuItem: item,
            variation: selectedVariation,
            addons: selectedAddons,
            quantity,
            specialInstructions,
            totalPrice: calculatePrice(),
        });
        onClose();
    };

    const toggleAddon = (addon: ItemAddon) => {
        if (selectedAddons.find(a => a.id === addon.id)) {
            setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
        } else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Quantity Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-full border-2 border-primary-500 text-primary-500 flex items-center justify-center hover:bg-primary-50"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-full border-2 border-primary-500 text-primary-500 flex items-center justify-center hover:bg-primary-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Variations */}
                    {item.variations && item.variations.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Size
                            </label>
                            <div className="space-y-2">
                                {item.variations.map((variation) => (
                                    <label
                                        key={variation.id}
                                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="variation"
                                                checked={selectedVariation?.id === variation.id}
                                                onChange={() => setSelectedVariation(variation)}
                                                className="w-4 h-4 text-primary-500"
                                            />
                                            <span>{variation.name}</span>
                                        </div>
                                        <span className="font-semibold">₹{variation.price}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Addons */}
                    {item.addons && item.addons.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add-ons
                            </label>
                            <div className="space-y-2">
                                {item.addons.map((addon) => (
                                    <label
                                        key={addon.id}
                                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedAddons.some(a => a.id === addon.id)}
                                                onChange={() => toggleAddon(addon)}
                                                className="w-4 h-4 text-primary-500 rounded"
                                            />
                                            <span>{addon.name}</span>
                                        </div>
                                        <span className="font-semibold">+₹{addon.price}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Special Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Instructions (If any)
                        </label>
                        <textarea
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            className="input-field resize-none"
                            rows={3}
                            placeholder="e.g., Less spicy, no onions..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t p-4">
                    <button
                        onClick={handleAddToCart}
                        className="btn-primary w-full flex items-center justify-between"
                    >
                        <span>Add to Cart</span>
                        <span>₹{calculatePrice()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemCustomizationModal;
