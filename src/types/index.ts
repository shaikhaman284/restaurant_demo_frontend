// Common Types
export interface Restaurant {
    id: string;
    name: string;
    logo?: string;
    gstNumber?: string;
    fssaiNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface Staff {
    id: string;
    restaurantId: string;
    name: string;
    email: string;
    role: StaffRole;
    isActive: boolean;
}

export enum StaffRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    WAITER = 'WAITER',
    CASHIER = 'CASHIER',
    KITCHEN = 'KITCHEN',
}

export interface Table {
    id: string;
    restaurantId: string;
    tableNumber: string;
    qrCode: string;
    capacity: number;
    status: TableStatus;
    currentAmount: number;
}

export enum TableStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    RESERVED = 'RESERVED',
    CLEANING = 'CLEANING',
}

export interface Category {
    id: string;
    restaurantId: string;
    name: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
    menuItems?: MenuItem[];
}

export interface MenuItem {
    id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    shortCode?: string;
    onlineDisplayName?: string;
    description?: string;
    price: number;
    image?: string;
    dietary: DietaryType;
    isCustomizable: boolean;
    isActive: boolean;
    availableFor: string[];
    variations?: ItemVariation[];
    addons?: ItemAddon[];
}

export enum DietaryType {
    VEG = 'VEG',
    NON_VEG = 'NON_VEG',
    VEGAN = 'VEGAN',
}

export interface ItemVariation {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    isActive: boolean;
}

export interface ItemAddon {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    isActive: boolean;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export interface Order {
    id: string;
    restaurantId: string;
    tableId: string;
    customerId: string;
    orderNumber: string;
    orderType: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    tax: number;
    taxAmount: number;
    total: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    specialInstructions?: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    orderItems: OrderItem[];
    customer?: Customer;
    table?: Table;
    kots?: KOT[];
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    SERVED = 'SERVED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    UPI = 'UPI',
    SPLIT = 'SPLIT',
}

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    variationId?: string;
    quantity: number;
    price: number;
    totalPrice: number;
    addonIds: string[];
    addons?: ItemAddon[];
    specialInstructions?: string;
    menuItem: MenuItem;
    variation?: ItemVariation;
}

export interface KOT {
    id: string;
    orderId: string;
    kotNumber: string;
    status: KOTStatus;
    printedAt?: string;
    completedAt?: string;
    createdAt: string;
    order?: Order;
}

export enum KOTStatus {
    PENDING = 'PENDING',
    PRINTED = 'PRINTED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    SERVED = 'SERVED',
}

// Cart Types
export interface CartItem {
    menuItem: MenuItem;
    variation?: ItemVariation;
    addons: ItemAddon[];
    quantity: number;
    specialInstructions?: string;
    totalPrice: number;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: StaffRole;
        restaurantId: string;
        restaurant: {
            id: string;
            name: string;
            logo?: string;
        };
    };
}

export interface OTPRequest {
    phone: string;
    name: string;
}

export interface OTPVerification {
    phone: string;
    name: string;
    otp: string;
    tableId: string;
}

export interface CustomerSession {
    sessionToken: string;
    customer: Customer;
}
