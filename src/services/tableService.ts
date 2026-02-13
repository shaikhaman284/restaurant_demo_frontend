import apiClient from './apiService';
import { Table } from '../types';

export const getTables = async (restaurantId: string) => {
    return apiClient.get<Table[]>(`/tables/restaurant/${restaurantId}`);
};

export const getTable = async (id: string) => {
    return apiClient.get<Table>(`/tables/${id}`);
};

export const createTable = async (data: { restaurantId: string; tableNumber: string; capacity: number }) => {
    return apiClient.post<Table>('/tables', data);
};

export const updateTable = async (id: string, data: Partial<Table>) => {
    return apiClient.put<Table>(`/tables/${id}`, data);
};

export const deleteTable = async (id: string) => {
    return apiClient.delete(`/tables/${id}`);
};

export const getTableQR = async (id: string) => {
    return apiClient.get<{ qrCode: string }>(`/tables/${id}/qr`);
};
