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
import { billingAPI } from '../api';
import { formatCurrency } from '../config/currency';
import { Plus, Edit, Trash2, Eye, Search, Download } from 'lucide-react';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    bill_number: '',
    billed_to: '',
    amount: '',
    note: '',
    issued_at: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [confirmState, setConfirmState] = useState({ open: false, bill: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBills();
      setBills(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bills');
      console.error('Fetch bills error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBillNumber = () => {
    const timestamp = Date.now();
    return `BILL-${timestamp.toString().slice(-6)}`;
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedBill(null);
    setFormData({
      bill_number: generateBillNumber(),
      billed_to: '',
      amount: '',
      note: '',
      issued_at: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (bill) => {
    setModalMode('edit');
    setSelectedBill(bill);
    setFormData({
      bill_number: bill.bill_number,
      billed_to: bill.billed_to,
      amount: bill.amount,
      note: bill.note || '',
      issued_at: bill.issued_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (bill) => {
    setModalMode('view');
    setSelectedBill(bill);
    setShowModal(true);
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, visible: true, duration });
  };

  const handleCloseToast = () => setToast(t => ({ ...t, visible: false }));

  const handleDelete = (bill) => {
    setConfirmState({ open: true, bill });
  };

  const handleConfirmDelete = async () => {
    const bill = confirmState.bill;
    setConfirmLoading(true);
    try {
        await billingAPI.deleteBill(bill.id);
        setBills(prev => prev.filter(b => b.id !== bill.id));
        showToast(`Bill #${bill.bill_number || bill.id} for "${bill.billed_to || 'Unknown'}" deleted successfully`, 'success');
    } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        showToast(`Failed to delete bill: ${errorMessage}`, 'error');
        console.error('Delete bill error:', err);
    } finally {
        setConfirmLoading(false);
        setConfirmState({ open: false, bill: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.bill_number.trim()) {
      errors.bill_number = 'Bill number is required';
    }
    
    if (!formData.billed_to.trim()) {
      errors.billed_to = 'Billed to is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.issued_at) {
      errors.issued_at = 'Issue date is required';
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
        const response = await billingAPI.createBill(formData);
        setBills(prev => [response.data, ...prev]);
        showToast('Bill created successfully', 'success');
      } else {
        const response = await billingAPI.updateBill(selectedBill.id, formData);
        setBills(prev => prev.map(b => 
          b.id === selectedBill.id ? response.data : b
        ));
        showToast('Bill updated successfully', 'success');
      }
      setShowModal(false);
    } catch (err) {
      let errorMsg = `Failed to ${modalMode} bill`;
      if (err?.data) {
        if (typeof err.data === 'string') errorMsg += `: ${err.data}`;
        else if (typeof err.data === 'object') errorMsg += `: ${Object.values(err.data).join(', ')}`;
      } else if (err?.message) {
        errorMsg += `: ${err.message}`;
      }
      showToast(errorMsg, 'error');
      console.error(`${modalMode} bill error:`, err);
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

  const filteredBills = bills.filter(bill =>
    bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billed_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'bill_number',
      header: 'Bill Number'
    },
    {
      key: 'issued_at',
      header: 'Issue Date',
      render: (bill) => new Date(bill.issued_at).toLocaleDateString()
    },
    {
      key: 'billed_to',
      header: 'Billed To'
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (bill) => formatCurrency(bill.amount)
    },
    {
      key: 'note',
      header: 'Note',
      render: (bill) => bill.note || '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (bill) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(bill)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(bill)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDownloadPDF(bill)}
            className="text-green-600 hover:text-green-800"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(bill)}
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
        title="Delete Bill"
        message={`Are you sure you want to delete bill #${confirmState.bill?.bill_number || confirmState.bill?.id} for ${confirmState.bill?.billed_to}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, bill: null })}
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmLoading}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
            <p className="text-gray-600">Manage your billing and invoices</p>
          </div>
          <Button onClick={handleCreate} className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Bill
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
                placeholder="Search bills..."
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

        {/* Bills Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="lg" />
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredBills}
              className="min-w-full"
            />
          )}
        </Card>

        {/* Bill Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalMode === 'create' ? 'Create Bill' :
            modalMode === 'edit' ? 'Edit Bill' :
            'Bill Details'
          }
          size="md"
        >
          {modalMode === 'view' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBill?.bill_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Billed To</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBill?.billed_to}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(selectedBill?.amount || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedBill?.issued_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBill?.note || 'No note provided'}</p>
              </div>
              <div className="pt-4">
                <Button
                  onClick={() => handleDownloadPDF(selectedBill)}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Bill Number"
                name="bill_number"
                value={formData.bill_number}
                onChange={handleFormChange}
                error={formErrors.bill_number}
                required
                disabled={modalMode === 'edit'}
              />
              
              <InputField
                label="Billed To"
                name="billed_to"
                value={formData.billed_to}
                onChange={handleFormChange}
                error={formErrors.billed_to}
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
                label="Issue Date"
                name="issued_at"
                type="date"
                value={formData.issued_at}
                onChange={handleFormChange}
                error={formErrors.issued_at}
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
                  {modalMode === 'create' ? 'Create Bill' : 'Update Bill'}
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

export default BillsPage;
