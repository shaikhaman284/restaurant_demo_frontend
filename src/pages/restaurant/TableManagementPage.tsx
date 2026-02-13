import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Download, Printer, X } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { getTables, createTable, updateTable, deleteTable } from '../../services/tableService';
import type { Table } from '../../types';
import Toast from '../../components/common/Toast';

const TableManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({ tableNumber: '', capacity: 4 });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
            const response = await getTables(user?.restaurantId!);
            setTables(response.data);
        } catch (error) {
            console.error('Error loading tables:', error);
            showToast('Failed to load tables', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTable) {
                await updateTable(editingTable.id, {
                    tableNumber: formData.tableNumber,
                    capacity: formData.capacity,
                });
                showToast('Table updated successfully', 'success');
            } else {
                await createTable({
                    restaurantId: user?.restaurantId!,
                    tableNumber: formData.tableNumber,
                    capacity: formData.capacity,
                });
                showToast('Table created successfully', 'success');
            }
            setShowModal(false);
            setEditingTable(null);
            setFormData({ tableNumber: '', capacity: 4 });
            loadTables();
        } catch (error) {
            console.error('Error saving table:', error);
            showToast('Failed to save table', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        try {
            await deleteTable(id);
            showToast('Table deleted successfully', 'success');
            loadTables();
        } catch (error) {
            console.error('Error deleting table:', error);
            showToast('Failed to delete table', 'error');
        }
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setFormData({ tableNumber: table.tableNumber, capacity: table.capacity });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingTable(null);
        setFormData({ tableNumber: '', capacity: 4 });
        setShowModal(true);
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

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="spinner w-12 h-12"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm no-print">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button onClick={() => navigate('/restaurant/dashboard')} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
                        <div className="flex gap-3">
                            <button onClick={handlePrintAll} className="btn-secondary flex items-center gap-2">
                                <Printer className="w-5 h-5" /> Print QRs
                            </button>
                            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Add Table
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tables.map((table) => (
                        <div key={table.id} className="bg-white rounded-lg shadow-sm p-6 qr-card relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                <button onClick={() => handleEdit(table)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(table.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Table {table.tableNumber}</h3>
                                <p className="text-gray-600 text-sm mb-4">Capacity: {table.capacity} • Status: {table.status}</p>

                                <div className="bg-white p-2 border rounded-lg inline-block mb-4">
                                    <img src={table.qrCode} alt={`Table ${table.tableNumber} QR`} className="w-32 h-32" />
                                </div>

                                <button onClick={() => handleDownloadQR(table)} className="w-full btn-secondary flex items-center justify-center gap-2 no-print">
                                    <Download className="w-4 h-4" /> Download QR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.tableNumber}
                                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingTable ? 'Save Changes' : 'Create Table'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .qr-card { break-inside: avoid; box-shadow: none; border: 1px solid #eee; }
                }
            `}</style>
        </div>
    );
};

export default TableManagementPage;
