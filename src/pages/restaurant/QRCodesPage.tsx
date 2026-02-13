import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import apiService from '../../services/apiService';
import { useAuthStore } from '../../store/useStore';
import type { Table } from '../../types';

const QRCodesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/restaurant/login');
            return;
        }
        loadTables();
    }, [user]);

    const loadTables = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/tables/restaurant/${user?.restaurantId}`);
            setTables(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading tables:', error);
            setLoading(false);
        }
    };

    const handleDownloadQR = (table: Table) => {
        const link = document.createElement('a');
        link.href = table.qrCode;
        link.download = `table-${table.tableNumber}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintAll = () => {
        window.print();
    };

    const getTableUrl = (table: Table) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/order/${user?.restaurantId}/${table.id}`;
    };

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
            <div className="bg-white shadow-sm no-print">
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
                            <h1 className="text-2xl font-bold text-gray-900">Table QR Codes</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Download or print QR codes for your tables
                            </p>
                        </div>
                        <button
                            onClick={handlePrintAll}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Printer className="w-5 h-5" />
                            Print All
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Codes Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            className="bg-white rounded-lg shadow-sm p-6 text-center qr-card"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Table {table.tableNumber}
                            </h3>

                            {/* QR Code */}
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                                <img
                                    src={table.qrCode}
                                    alt={`QR Code for Table ${table.tableNumber}`}
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Table Info */}
                            <div className="text-sm text-gray-600 mb-4">
                                <p>Capacity: {table.capacity} guests</p>
                                <p className="text-xs mt-2 break-all">{getTableUrl(table)}</p>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={() => handleDownloadQR(table)}
                                className="w-full btn-secondary flex items-center justify-center gap-2 no-print"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .qr-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          body {
            background: white;
          }
        }
      `}</style>
        </div>
    );
};

export default QRCodesPage;
