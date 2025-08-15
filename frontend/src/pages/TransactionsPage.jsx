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
import { Plus, Edit, Trash2, Eye, Search, CreditCard } from 'lucide-react';

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
    const [successModal, setSuccessModal] = useState({ open: false, transaction: null });

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
            await transactionAPI.deleteTransaction(transaction.id);
            setTransactions(prev => prev.filter(t => t.id !== transaction.id));
            showToast(`Transaction from "${transaction.received_from || 'Unknown'}" deleted successfully`, 'success');
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
                setShowModal(false);
                
                // Show success modal with options
                setSuccessModal({ open: true, transaction: response.data });
                showToast('Transaction created successfully', 'success');
            } else {
                const response = await transactionAPI.updateTransaction(selectedTransaction.id, formData);
                setTransactions(prev => prev.map(t =>
                    t.id === selectedTransaction.id ? response.data : t
                ));
                showToast('Transaction updated successfully', 'success');
                setShowModal(false);
            }
        } catch (err) {
            let errorMsg = `Failed to ${modalMode} transaction`;
            if (err?.data) {
                if (typeof err.data === 'string') errorMsg += `: ${err.data}`;
                else if (typeof err.data === 'object') errorMsg += `: ${Object.values(err.data).join(', ')}`;
            } else if (err?.message) {
                errorMsg += `: ${err.message}`;
            }
            showToast(errorMsg, 'error');
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
        (transaction.received_from || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.note || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Success Modal for Transaction Creation */}
            <Modal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ open: false, transaction: null })}
                title="Transaction Created Successfully!"
                size="md"
            >
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Transaction recorded successfully!
                        </h3>
                        <p className="text-sm text-gray-500">
                            {formatCurrency(successModal.transaction?.amount || 0)} from {successModal.transaction?.received_from}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 text-center">
                            Transaction has been added to your records.
                        </p>
                        
                        <Button
                            onClick={() => setSuccessModal({ open: false, transaction: null })}
                            className="w-full"
                        >
                            Continue
                        </Button>
                        
                        <Button
                            onClick={() => {
                                setSuccessModal({ open: false, transaction: null });
                                handleCreate();
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Add Another Transaction
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-3 rounded-lg">
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Transactions</h1>
                                <p className="text-blue-100 mt-1">Manage your financial transactions</p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button
                                onClick={handleCreate}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Transaction
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                {/* Search */}
                <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <InputField
                                placeholder="Search transactions by sender or note..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                inputClassName="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="text-sm text-gray-600 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-medium text-blue-700">{filteredTransactions.length}</span> transactions found
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card className="overflow-hidden shadow-lg">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loading size="lg" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Transactions ({filteredTransactions.length})</h3>
                            </div>
                            <Table
                                columns={columns}
                                data={filteredTransactions}
                                className="min-w-full"
                            />
                        </>
                    )}
                </Card>

                {/* Transaction Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={
                        modalMode === 'create' ? '💰 Add Transaction' :
                            modalMode === 'edit' ? '✏️ Edit Transaction' :
                                '📊 Transaction Details'
                    }
                    size="lg"
                >
                    {modalMode === 'view' ? (
                        <div className="space-y-6">
                            {/* Transaction Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-900">TRANSACTION</h3>
                                        <p className="text-blue-700 font-medium">#{selectedTransaction?.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600">Transaction Date</p>
                                        <p className="text-sm font-medium">{new Date(selectedTransaction?.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Payment From:</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-medium text-sm">{selectedTransaction?.received_from}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Amount</h4>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(selectedTransaction?.amount || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Transaction Date</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedTransaction?.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {selectedTransaction?.note && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                            <p className="text-sm text-gray-700">{selectedTransaction.note}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Transaction Summary */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Transaction Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-medium">#{selectedTransaction?.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Received From:</span>
                                        <span className="font-medium">{selectedTransaction?.received_from}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium">{new Date(selectedTransaction?.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-900">Amount:</span>
                                            <span className="text-xl font-bold text-green-600">{formatCurrency(selectedTransaction?.amount || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Transaction Information */}
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-900 mb-1">Transaction Details</h4>
                                    <p className="text-xs text-blue-700">Enter the payment information below</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Received From"
                                        name="received_from"
                                        value={formData.received_from}
                                        onChange={handleFormChange}
                                        error={formErrors.received_from}
                                        required
                                        placeholder="Customer, client, or source name"
                                    />

                                    <InputField
                                        label="Transaction Date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleFormChange}
                                        error={formErrors.date}
                                        required
                                    />
                                </div>

                                <CurrencyInput
                                    label="Amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    error={formErrors.amount}
                                    required
                                    placeholder="0.00"
                                />

                                <InputField
                                    label="Note / Description"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleFormChange}
                                    placeholder="Add a description or note for this transaction..."
                                />
                            </div>

                            {/* Transaction Summary */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                <h4 className="text-sm font-medium text-green-900 mb-3">Transaction Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-700">From:</span>
                                        <span className="font-medium text-green-900">{formData.received_from || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-700">Date:</span>
                                        <span className="font-medium text-green-900">
                                            {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not selected'}
                                        </span>
                                    </div>
                                    <div className="border-t border-green-200 pt-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-green-900">Amount:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                {formatCurrency(parseFloat(formData.amount) || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    loading={submitting}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? 'Processing...' : (modalMode === 'create' ? 'Create Transaction' : 'Update Transaction')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                    disabled={submitting}
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
