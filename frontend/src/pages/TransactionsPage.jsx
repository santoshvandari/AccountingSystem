import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Table from '../components/Table/Table';
import Modal from '../components/Modal/Modal';
import InputField from '../components/InputField/InputField';
import CurrencyInput from '../components/CurrencyInput/CurrencyInput';
import Loading from '../components/Loading/Loading';
import Alert from '../components/Alert/Alert';
import Toast from '../components/Toast/Toast';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { transactionAPI } from '../api';
import { formatCurrency } from '../config/currency';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [formData, setFormData] = useState({
        received_from: '',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
    const [confirmState, setConfirmState] = useState({ open: false, transaction: null });
    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionAPI.getTransactions();
            setTransactions(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch transactions');
            console.error('Fetch transactions error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalMode('create');
        setSelectedTransaction(null);
        setFormData({
            received_from: '',
            amount: '',
            note: '',
            date: new Date().toISOString().split('T')[0]
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEdit = (transaction) => {
        setModalMode('edit');
        setSelectedTransaction(transaction);
        setFormData({
            received_from: transaction.received_from,
            amount: transaction.amount,
            note: transaction.note || '',
            date: transaction.date
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleView = (transaction) => {
        setModalMode('view');
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    const showToast = (message, type = 'info', duration = 3000) => {
        setToast({ message, type, visible: true, duration });
    };

    const handleCloseToast = () => setToast(t => ({ ...t, visible: false }));

    const handleDelete = (transaction) => {
        setConfirmState({ open: true, transaction });
    };

    const handleConfirmDelete = async () => {
        const transaction = confirmState.transaction;
        setConfirmLoading(true);
        try {
            const res = await transactionAPI.deleteTransaction(transaction.id);
            if (res.status !== 204) {
                throw new Error('Failed to delete transaction');
            }
            setTransactions(prev => prev.filter(t => t.id !== transaction.id));
            showToast(`Transaction from "${transaction.received_from}" deleted successfully`, 'success');
        } catch (err) {
            showToast(`Failed to delete transaction: ${err.message || 'Unknown error'}`, 'error');
            console.error('Delete transaction error:', err);
        } finally {
            setConfirmLoading(false);
            setConfirmState({ open: false, transaction: null });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.received_from.trim()) {
            errors.received_from = 'Received from is required';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }

        if (!formData.date) {
            errors.date = 'Date is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                const response = await transactionAPI.createTransaction(formData);
                setTransactions(prev => [response.data, ...prev]);
                showToast('Transaction created successfully', 'success');
            } else {
                const response = await transactionAPI.updateTransaction(selectedTransaction.id, formData);
                setTransactions(prev => prev.map(t =>
                    t.id === selectedTransaction.id ? response.data : t
                ));
                showToast('Transaction updated successfully', 'success');
            }
            setShowModal(false);
        } catch (err) {
            showToast(`Failed to ${modalMode} transaction`, 'error');
            console.error(`${modalMode} transaction error:`, err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const filteredTransactions = transactions.filter(transaction =>
        transaction.received_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: 'date',
            header: 'Date',
            render: (transaction) => new Date(transaction.date).toLocaleDateString()
        },
        {
            key: 'received_from',
            header: 'Received From'
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (transaction) => formatCurrency(transaction.amount)
        },
        {
            key: 'note',
            header: 'Note',
            render: (transaction) => transaction.note || '-'
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (transaction) => (
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(transaction)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(transaction)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout>
            {/* Toast Notification */}
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={handleCloseToast}
                    duration={toast.duration}
                />
            )}
            {/* Confirm Modal for Delete */}
            <ConfirmModal
                isOpen={confirmState.open}
                title="Delete Transaction"
                message={`Are you sure you want to delete this transaction from ${confirmState.transaction?.received_from}?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmState({ open: false, transaction: null })}
                confirmText="Delete"
                cancelText="Cancel"
                loading={confirmLoading}
            />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                        <p className="text-gray-600">Manage your financial transactions</p>
                    </div>
                    <Button onClick={handleCreate} className="mt-4 sm:mt-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                {/* Search and Filters */}
                <Card>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <InputField
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                inputClassName="pl-10"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loading size="lg" />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={filteredTransactions}
                            className="min-w-full"
                        />
                    )}
                </Card>

                {/* Transaction Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={
                        modalMode === 'create' ? 'Add Transaction' :
                            modalMode === 'edit' ? 'Edit Transaction' :
                                'Transaction Details'
                    }
                    size="md"
                >
                    {modalMode === 'view' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Received From</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedTransaction?.received_from}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {formatCurrency(selectedTransaction?.amount || 0)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(selectedTransaction?.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Note</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedTransaction?.note || 'No note provided'}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField
                                label="Received From"
                                name="received_from"
                                value={formData.received_from}
                                onChange={handleFormChange}
                                error={formErrors.received_from}
                                required
                            />

                            <CurrencyInput
                                label="Amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleFormChange}
                                error={formErrors.amount}
                                required
                            />

                            <InputField
                                label="Date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleFormChange}
                                error={formErrors.date}
                                required
                            />

                            <InputField
                                label="Note"
                                name="note"
                                value={formData.note}
                                onChange={handleFormChange}
                                placeholder="Optional note..."
                            />

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    type="submit"
                                    loading={submitting}
                                    disabled={submitting}
                                >
                                    {modalMode === 'create' ? 'Create Transaction' : 'Update Transaction'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default TransactionsPage;
