import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from './pages/customer/MenuPage';
import OrdersPage from './pages/customer/OrdersPage';
import BillRequestPage from './pages/customer/BillRequestPage';
import StaffLoginPage from './pages/restaurant/StaffLoginPage';
import Dashboard from './pages/restaurant/Dashboard';
import TableDetailPage from './pages/restaurant/TableDetailPage';
import OrderDetailPage from './pages/restaurant/OrderDetailPage';
import BillingPage from './pages/restaurant/BillingPage';
import TableManagementPage from './pages/restaurant/TableManagementPage';
import OrderHistoryPage from './pages/restaurant/OrderHistoryPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';
import './index.css';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Customer Routes */}
                <Route path="/order/:restaurantId/:tableId" element={<MenuPage />} />
                <Route path="/order/:restaurantId/:tableId/orders" element={<OrdersPage />} />
                <Route path="/order/:restaurantId/:tableId/bill" element={<BillRequestPage />} />

                {/* Restaurant Routes */}
                <Route path="/restaurant/login" element={<StaffLoginPage />} />
                <Route path="/restaurant/dashboard" element={<Dashboard />} />
                <Route path="/restaurant/table/:tableId" element={<TableDetailPage />} />
                <Route path="/restaurant/order/:orderId" element={<OrderDetailPage />} />
                <Route path="/restaurant/billing/:orderId" element={<BillingPage />} />
                <Route path="/restaurant/tables" element={<TableManagementPage />} />
                <Route path="/restaurant/history" element={<OrderHistoryPage />} />
                <Route path="/restaurant/menu" element={<MenuManagementPage />} />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/restaurant/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
