import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
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
import { Plus, Edit, Trash2, Eye, Search, Download, Printer } from 'lucide-react';

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
  const [successModal, setSuccessModal] = useState({ open: false, bill: null });

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

  const handleDownloadPDF = async (bill) => {
    try {
      showToast('Generating PDF...', 'info');
      
      // Create new jsPDF instance
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set up colors
      const primaryColor = [37, 99, 235]; // Blue
      const textColor = [31, 41, 55]; // Gray-800
      const lightGray = [243, 244, 246]; // Gray-100
      
      // Header
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Company/Invoice title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Bill #${bill.bill_number}`, pageWidth / 2, 30, { align: 'center' });
      
      // Reset text color for body
      pdf.setTextColor(...textColor);
      
      // Bill details section
      let yPosition = 60;
      
      // Bill To and Date section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 20, yPosition);
      pdf.text('Issue Date:', pageWidth - 70, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(bill.billed_to, 20, yPosition + 10);
      pdf.text(new Date(bill.issued_at).toLocaleDateString(), pageWidth - 70, yPosition + 10);
      
      // Amount section
      yPosition += 40;
      
      // Draw amount box
      pdf.setFillColor(...lightGray);
      pdf.rect(20, yPosition, pageWidth - 40, 30, 'F');
      
      // Amount label and value
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Amount Due:', 30, yPosition + 15);
      
      pdf.setFontSize(18);
      pdf.setTextColor(...primaryColor);
      pdf.text(formatCurrency(bill.amount), pageWidth - 30, yPosition + 15, { align: 'right' });
      
      // Reset color
      pdf.setTextColor(...textColor);
      
      // Note section (if exists)
      if (bill.note) {
        yPosition += 50;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Note:', 20, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        // Handle long notes by splitting into lines
        const noteLines = pdf.splitTextToSize(bill.note, pageWidth - 40);
        pdf.text(noteLines, 20, yPosition + 10);
        yPosition += (noteLines.length * 5) + 10;
      }
      
      // Footer
      const footerY = pageHeight - 40;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, footerY, pageWidth - 20, footerY);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 10, { align: 'center' });
      pdf.text('Thank you for your business!', pageWidth / 2, footerY + 20, { align: 'center' });
      
      // Save the PDF
      pdf.save(`bill-${bill.bill_number}.pdf`);
      
      showToast(`PDF downloaded successfully for bill #${bill.bill_number}`, 'success');
    } catch (err) {
      showToast('Failed to generate PDF. Please try again.', 'error');
      console.error('PDF generation error:', err);
    }
  };

  const handlePrint = (bill) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get current date for the print
    const currentDate = new Date().toLocaleDateString();
    const issueDate = new Date(bill.issued_at).toLocaleDateString();
    
    // Create the HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill #${bill.bill_number}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #1f2937;
              line-height: 1.6;
            }
            .header {
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              text-align: center;
              padding: 30px 20px;
              margin: -20px -20px 30px -20px;
              border-radius: 0;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .header h2 {
              margin: 0;
              font-size: 18px;
              font-weight: normal;
              opacity: 0.9;
            }
            .bill-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
            }
            .bill-info div {
              flex: 1;
            }
            .bill-info h3 {
              margin: 0 0 10px 0;
              color: #2563eb;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .bill-info p {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
            }
            .amount-section {
              background: #f1f5f9;
              padding: 25px;
              border-radius: 12px;
              margin-bottom: 30px;
              border: 2px solid #e2e8f0;
            }
            .amount-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .amount-label {
              font-size: 16px;
              font-weight: 600;
              color: #475569;
            }
            .amount {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
            }
            .note {
              background: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              margin-bottom: 30px;
            }
            .note h4 {
              margin: 0 0 10px 0;
              color: #92400e;
              font-size: 16px;
            }
            .note p {
              margin: 0;
              color: #78350f;
              line-height: 1.5;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
            }
            .footer p {
              margin: 5px 0;
            }
            .company-info {
              margin-top: 20px;
              font-style: italic;
              color: #9ca3af;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
              }
              .header {
                margin: -15px -15px 20px -15px;
              }
              .no-print { 
                display: none; 
              }
            }
            @page {
              margin: 0.5in;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>Bill #${bill.bill_number}</h2>
          </div>
          
          <div class="bill-info">
            <div>
              <h3>Bill To</h3>
              <p>${bill.billed_to}</p>
            </div>
            <div>
              <h3>Issue Date</h3>
              <p>${issueDate}</p>
            </div>
          </div>
          
          <div class="amount-section">
            <div class="amount-container">
              <span class="amount-label">Amount Due:</span>
              <span class="amount">${formatCurrency(bill.amount)}</span>
            </div>
          </div>
          
          ${bill.note ? `
            <div class="note">
              <h4>Additional Notes:</h4>
              <p>${bill.note}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>Generated on ${currentDate}</strong></p>
            <p>Thank you for your business!</p>
            <div class="company-info">
              <p>This is a computer-generated invoice.</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 100);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
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
        setShowModal(false);
        
        // Show success toast
        showToast('Bill created successfully', 'success');
        
        // Show success modal with print/download options
        setSuccessModal({ open: true, bill: response.data });
      } else {
        const response = await billingAPI.updateBill(selectedBill.id, formData);
        setBills(prev => prev.map(b => 
          b.id === selectedBill.id ? response.data : b
        ));
        showToast('Bill updated successfully', 'success');
        setShowModal(false);
      }
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
            onClick={() => handlePrint(bill)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Printer className="w-4 h-4" />
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

      {/* Success Modal for Bill Creation */}
      <Modal
        isOpen={successModal.open}
        onClose={() => setSuccessModal({ open: false, bill: null })}
        title="Bill Created Successfully!"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bill #{successModal.bill?.bill_number} has been created successfully!
            </h3>
            <p className="text-sm text-gray-500">
              For {successModal.bill?.billed_to} • {formatCurrency(successModal.bill?.amount || 0)}
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Would you like to print or download this bill now?
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  handlePrint(successModal.bill);
                  setSuccessModal({ open: false, bill: null });
                }}
                className="flex-1"
                variant="outline"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Now
              </Button>
              <Button
                onClick={() => {
                  handleDownloadPDF(successModal.bill);
                  setSuccessModal({ open: false, bill: null });
                }}
                className="flex-1"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
            
            <Button
              onClick={() => setSuccessModal({ open: false, bill: null })}
              variant="ghost"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>
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
              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => handlePrint(selectedBill)}
                  variant="outline"
                  className="w-full"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Bill
                </Button>
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
