import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResponse, Customer, CartItem, Order, Table, Category } from '../types';

interface AuthState {
    // Staff auth
    token: string | null;
    user: LoginResponse['user'] | null;
    setAuth: (token: string, user: LoginResponse['user']) => void;
    clearAuth: () => void;
    logout: () => void;

    // Customer auth
    sessionToken: string | null;
    customer: Customer | null;
    tableId: string | null;
    setCustomerSession: (sessionToken: string, customer: Customer, tableId: string) => void;
    clearCustomerSession: () => void;
}

interface MenuState {
    categories: Category[];
    selectedCategory: string | null;
    searchQuery: string;
    dietaryFilter: 'ALL' | 'VEG' | 'NON_VEG';
    setCategories: (categories: Category[]) => void;
    setSelectedCategory: (categoryId: string | null) => void;
    setSearchQuery: (query: string) => void;
    setDietaryFilter: (filter: 'ALL' | 'VEG' | 'NON_VEG') => void;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (menuItemId: string, variationId?: string) => void;
    updateQuantity: (menuItemId: string, quantity: number, variationId?: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    setOrders: (orders: Order[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    setCurrentOrder: (order: Order | null) => void;
}

interface TableState {
    tables: Table[];
    selectedTable: Table | null;
    setTables: (tables: Table[]) => void;
    setSelectedTable: (table: Table | null) => void;
    updateTable: (tableId: string, updates: Partial<Table>) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            sessionToken: null,
            customer: null,
            tableId: null,
            setAuth: (token, user) => {
                localStorage.setItem('authToken', token);
                set({ token, user });
            },
            clearAuth: () => {
                localStorage.removeItem('authToken');
                set({ token: null, user: null });
            },
            logout: () => {
                localStorage.removeItem('authToken');
                set({ token: null, user: null });
            },
            setCustomerSession: (sessionToken, customer, tableId) => {
                set({ sessionToken, customer, tableId });
            },
            clearCustomerSession: () => {
                set({ sessionToken: null, customer: null, tableId: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

// Menu Store
export const useMenuStore = create<MenuState>((set) => ({
    categories: [],
    selectedCategory: null,
    searchQuery: '',
    dietaryFilter: 'ALL',
    setCategories: (categories) => set({ categories }),
    setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setDietaryFilter: (filter) => set({ dietaryFilter: filter }),
}));

// Cart Store
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const items = get().items;
                const existingIndex = items.findIndex(
                    (i) =>
                        i.menuItem.id === item.menuItem.id &&
                        i.variation?.id === item.variation?.id
                );

                if (existingIndex >= 0) {
                    const newItems = [...items];
                    newItems[existingIndex].quantity += item.quantity;
                    newItems[existingIndex].totalPrice =
                        newItems[existingIndex].quantity *
                        (newItems[existingIndex].variation?.price || newItems[existingIndex].menuItem.price);
                    set({ items: newItems });
                } else {
                    set({ items: [...items, item] });
                }
            },
            removeItem: (menuItemId, variationId) => {
                set({
                    items: get().items.filter(
                        (item) =>
                            !(item.menuItem.id === menuItemId && item.variation?.id === variationId)
                    ),
                });
            },
            updateQuantity: (menuItemId, quantity, variationId) => {
                const items = get().items;
                const index = items.findIndex(
                    (i) => i.menuItem.id === menuItemId && i.variation?.id === variationId
                );

                if (index >= 0) {
                    const newItems = [...items];
                    if (quantity <= 0) {
                        newItems.splice(index, 1);
                    } else {
                        newItems[index].quantity = quantity;
                        newItems[index].totalPrice =
                            quantity * (newItems[index].variation?.price || newItems[index].menuItem.price);
                    }
                    set({ items: newItems });
                }
            },
            clearCart: () => set({ items: [] }),
            getTotal: () => {
                return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
            },
            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);

// Order Store
export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    currentOrder: null,
    setOrders: (orders) => set({ orders }),
    addOrder: (order) => set({ orders: [order, ...get().orders] }),
    updateOrder: (orderId, updates) => {
        set({
            orders: get().orders.map((order) =>
                order.id === orderId ? { ...order, ...updates } : order
            ),
        });
    },
    setCurrentOrder: (order) => set({ currentOrder: order }),
}));

// Table Store
export const useTableStore = create<TableState>((set, get) => ({
    tables: [],
    selectedTable: null,
    setTables: (tables) => set({ tables }),
    setSelectedTable: (table) => set({ selectedTable: table }),
    updateTable: (tableId, updates) => {
        set({
            tables: get().tables.map((table) =>
                table.id === tableId ? { ...table, ...updates } : table
            ),
        });
    },
}));
