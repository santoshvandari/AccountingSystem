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
import { Plus, Edit, Trash2, Eye, Search, Download, Printer, X, Receipt } from 'lucide-react';

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
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    tax_percentage: '0',
    discount_percentage: '0',
    payment_method: '',
    payment_details: '',
    note: '',
    bill_items: []
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
    return `INV-${timestamp.toString().slice(-6)}`;
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedBill(null);
    setFormData({
      bill_number: '', // Backend will generate automatically if empty
      billed_to: '',
      customer_address: '',
      customer_phone: '',
      customer_email: '',
      tax_percentage: '0',
      discount_percentage: '0',
      payment_method: '',
      payment_details: '',
      note: '',
      bill_items: [
        { description: '', quantity: 1, unit_price: 0, unit: 'piece', notes: '' }
      ]
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
      customer_address: bill.customer_address || '',
      customer_phone: bill.customer_phone || '',
      customer_email: bill.customer_email || '',
      tax_percentage: bill.tax_percentage?.toString() || '0',
      discount_percentage: bill.discount_percentage?.toString() || '0',
      payment_method: bill.payment_method || '',
      payment_details: bill.payment_details || '',
      note: bill.note || '',
      bill_items: bill.bill_items?.length > 0 ? bill.bill_items : [
        { description: '', quantity: 1, unit_price: 0, unit: 'piece', notes: '' }
      ]
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

  const addBillItem = () => {
    setFormData(prev => ({
      ...prev,
      bill_items: [...prev.bill_items, { description: '', quantity: 1, unit_price: 0, unit: 'piece', notes: '' }]
    }));
  };

  const removeBillItem = (index) => {
    setFormData(prev => ({
      ...prev,
      bill_items: prev.bill_items.filter((_, i) => i !== index)
    }));
  };

  const updateBillItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bill_items: prev.bill_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateSubtotal = () => {
    return formData.bill_items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    }, 0);
  };

  const calculateDiscount = (subtotal) => {
    const discountPercentage = parseFloat(formData.discount_percentage) || 0;
    return (subtotal * discountPercentage) / 100;
  };

  const calculateTax = (subtotal, discount) => {
    const taxPercentage = parseFloat(formData.tax_percentage) || 0;
    const taxableAmount = subtotal - discount;
    return (taxableAmount * taxPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const tax = calculateTax(subtotal, discount);
    return subtotal - discount + tax;
  };

  const handleDelete = (bill) => {
    setConfirmState({ open: true, bill });
  };

  const handleDownloadPDF = async (bill) => {
    try {
      showToast('Generating PDF...', 'info');
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Colors matching our design
      const primaryColor = [37, 99, 235]; // Blue
      const textColor = [31, 41, 55]; // Gray-800
      const lightGray = [243, 244, 246]; // Gray-100
      const accentColor = [250, 204, 21]; // Yellow
      
      // Header
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Invoice title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${bill.bill_number}`, pageWidth / 2, 30, { align: 'center' });
      
      // Reset text color
      pdf.setTextColor(...textColor);
      
      let yPosition = 60;
      
      // Customer Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice to:', 20, yPosition);
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.text(bill.billed_to, 20, yPosition);
      
      if (bill.customer_address) {
        yPosition += 6;
        const addressLines = pdf.splitTextToSize(bill.customer_address, 80);
        pdf.text(addressLines, 20, yPosition);
        yPosition += addressLines.length * 6;
      }
      
      if (bill.customer_phone || bill.customer_email) {
        if (bill.customer_phone) {
          yPosition += 6;
          pdf.text(`Phone: ${bill.customer_phone}`, 20, yPosition);
        }
        if (bill.customer_email) {
          yPosition += 6;
          pdf.text(`Email: ${bill.customer_email}`, 20, yPosition);
        }
      }
      
      // Invoice details (right side)
      const rightX = pageWidth - 80;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice #:', rightX, 60);
      pdf.text('Date:', rightX, 70);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(bill.bill_number, rightX + 25, 60);
      pdf.text(new Date(bill.issued_at).toLocaleDateString(), rightX + 25, 70);
      
      // Items table
      yPosition = Math.max(yPosition + 20, 100);
      
      // Table header
      pdf.setFillColor(...lightGray);
      pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(...primaryColor);
      pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
      
      pdf.text('ITEM DESCRIPTION', 25, yPosition + 10);
      pdf.text('QTY', pageWidth - 110, yPosition + 10);
      pdf.text('PRICE', pageWidth - 80, yPosition + 10);
      pdf.text('TOTAL', pageWidth - 40, yPosition + 10);
      
      yPosition += 15;
      pdf.setTextColor(...textColor);
      pdf.setFont('helvetica', 'normal');
      
      // Items
      bill.bill_items?.forEach((item, index) => {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 40;
        }
        
        // Alternate row background
        if (index % 2 === 1) {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
        }
        
        const descLines = pdf.splitTextToSize(item.description, 100);
        pdf.text(descLines, 25, yPosition + 5);
        pdf.text(item.quantity.toString(), pageWidth - 110, yPosition + 5);
        pdf.text(formatCurrency(item.unit_price), pageWidth - 80, yPosition + 5);
        pdf.text(formatCurrency(item.total || (item.quantity * item.unit_price)), pageWidth - 40, yPosition + 5);
        
        yPosition += Math.max(15, descLines.length * 5 + 5);
      });
      
      // Totals section
      yPosition += 10;
      const totalsX = pageWidth - 80;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('SUB TOTAL:', totalsX - 40, yPosition);
      pdf.text(formatCurrency(bill.subtotal), totalsX, yPosition);
      
      if (bill.discount_amount > 0) {
        yPosition += 10;
        pdf.text(`DISCOUNT (${bill.discount_percentage}%):`, totalsX - 40, yPosition);
        pdf.text(`-${formatCurrency(bill.discount_amount)}`, totalsX, yPosition);
      }
      
      if (bill.tax_amount > 0) {
        yPosition += 10;
        pdf.text(`TAX (${bill.tax_percentage}%):`, totalsX - 40, yPosition);
        pdf.text(formatCurrency(bill.tax_amount), totalsX, yPosition);
      }
      
      yPosition += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('GRAND TOTAL:', totalsX - 40, yPosition);
      pdf.text(formatCurrency(bill.total_amount), totalsX, yPosition);
      
      // Payment method section
      if (bill.payment_method) {
        yPosition += 20;
        pdf.setFillColor(...accentColor);
        pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PAYMENT METHOD', pageWidth / 2, yPosition + 10, { align: 'center' });
        
        yPosition += 20;
        pdf.setFont('helvetica', 'normal');
        pdf.text(bill.payment_method.replace('_', ' ').toUpperCase(), 25, yPosition);
        
        if (bill.payment_details) {
          yPosition += 10;
          const paymentLines = pdf.splitTextToSize(bill.payment_details, pageWidth - 50);
          pdf.text(paymentLines, 25, yPosition);
        }
      }
      
      // Footer
      const footerY = pageHeight - 40;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, footerY, pageWidth - 20, footerY);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('Thank you for business with us!', pageWidth / 2, footerY + 10, { align: 'center' });
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 20, { align: 'center' });
      
      if (bill.note) {
        pdf.text('Terms & Conditions can be here', pageWidth / 2, footerY + 30, { align: 'center' });
      }
      
      pdf.save(`invoice-${bill.bill_number}.pdf`);
      showToast(`PDF downloaded successfully for ${bill.bill_number}`, 'success');
    } catch (err) {
      showToast('Failed to generate PDF. Please try again.', 'error');
      console.error('PDF generation error:', err);
    }
  };

  const handlePrint = (bill) => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    const issueDate = new Date(bill.issued_at).toLocaleDateString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${bill.bill_number}</title>
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
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
            }
            .invoice-info div {
              flex: 1;
            }
            .invoice-info h3 {
              margin: 0 0 10px 0;
              color: #2563eb;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .invoice-info p {
              margin: 2px 0;
              font-size: 14px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .items-table th {
              background: #2563eb;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table td {
              padding: 12px 8px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .items-table tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .items-table tbody tr:hover {
              background-color: #f3f4f6;
            }
            .totals-section {
              margin-top: 30px;
              padding: 20px;
              background: #f1f5f9;
              border-radius: 8px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .totals-row.grand-total {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              border-top: 2px solid #2563eb;
              padding-top: 12px;
              margin-top: 12px;
            }
            .payment-method {
              background: #fbbf24;
              color: #92400e;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
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
            .note-section {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
            .note-section h4 {
              margin: 0 0 10px 0;
              color: #92400e;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
              }
              .header {
                margin: -15px -15px 20px -15px;
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
            <h2>${bill.bill_number}</h2>
          </div>
          
          <div class="invoice-info">
            <div>
              <h3>Invoice to</h3>
              <p><strong>${bill.billed_to}</strong></p>
              ${bill.customer_address ? `<p>${bill.customer_address}</p>` : ''}
              ${bill.customer_phone ? `<p>Phone: ${bill.customer_phone}</p>` : ''}
              ${bill.customer_email ? `<p>Email: ${bill.customer_email}</p>` : ''}
            </div>
            <div>
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${bill.bill_number}</p>
              <p><strong>Date:</strong> ${issueDate}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th width="10%">Qty</th>
                <th width="15%">Price</th>
                <th width="15%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.bill_items?.map(item => `
                <tr>
                  <td>
                    ${item.description}
                    ${item.notes ? `<br><small style="color: #6b7280;">${item.notes}</small>` : ''}
                  </td>
                  <td>${item.quantity} ${item.unit || ''}</td>
                  <td>${formatCurrency(item.unit_price)}</td>
                  <td>${formatCurrency(item.total || (item.quantity * item.unit_price))}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-row">
              <span>Sub Total:</span>
              <span>${formatCurrency(bill.subtotal)}</span>
            </div>
            ${bill.discount_amount > 0 ? `
              <div class="totals-row">
                <span>Discount (${bill.discount_percentage}%):</span>
                <span>-${formatCurrency(bill.discount_amount)}</span>
              </div>
            ` : ''}
            ${bill.tax_amount > 0 ? `
              <div class="totals-row">
                <span>Tax (${bill.tax_percentage}%):</span>
                <span>${formatCurrency(bill.tax_amount)}</span>
              </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>Grand Total:</span>
              <span>${formatCurrency(bill.total_amount)}</span>
            </div>
          </div>
          
          ${bill.payment_method ? `
            <div class="payment-method">
              Payment Method: ${bill.payment_method.replace('_', ' ')}
              ${bill.payment_details ? `<br><small>${bill.payment_details}</small>` : ''}
            </div>
          ` : ''}
          
          ${bill.note ? `
            <div class="note-section">
              <h4>Additional Notes:</h4>
              <p>${bill.note}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>Thank you for your patience with us!</strong></p>
            <p>Generated on ${currentDate}</p>
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
    
    // Invoice number is optional - backend will generate if not provided
    
    if (!formData.billed_to.trim()) {
      errors.billed_to = 'Customer name is required';
    }
    
    if (!formData.bill_items || formData.bill_items.length === 0) {
      errors.bill_items = 'At least one item is required';
    } else {
      formData.bill_items.forEach((item, index) => {
        if (!item.description.trim()) {
          errors[`item_${index}_description`] = 'Item description is required';
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        }
        if (item.unit_price === '' || parseFloat(item.unit_price) < 0) {
          errors[`item_${index}_unit_price`] = 'Unit price must be 0 or greater';
        }
      });
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
      // Clean the form data before sending
      const cleanedFormData = {
        ...formData,
        bill_items: formData.bill_items.map(item => ({
          ...item,
          // Remove currency formatting from unit_price
          unit_price: typeof item.unit_price === 'string' ? 
            parseFloat(item.unit_price.replace(/[^0-9.-]/g, '')) || 0 : 
            parseFloat(item.unit_price) || 0,
          quantity: parseFloat(item.quantity) || 1
        }))
      };

      if (modalMode === 'create') {
        const response = await billingAPI.createBill(cleanedFormData);
        setBills(prev => [response.data, ...prev]);
        setShowModal(false);
        
        // Show success toast
        showToast('Bill created successfully', 'success');
        
        // Show success modal with print/download options
        setSuccessModal({ open: true, bill: response.data });
      } else {
        const response = await billingAPI.updateBill(selectedBill.id, cleanedFormData);
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
      header: 'Invoice #'
    },
    {
      key: 'issued_at',
      header: 'Date',
      render: (bill) => new Date(bill.issued_at).toLocaleDateString()
    },
    {
      key: 'billed_to',
      header: 'Customer'
    },
    {
      key: 'items_count',
      header: 'Items',
      render: (bill) => bill.bill_items?.length || 0
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (bill) => formatCurrency(bill.total_amount || 0)
    },
    {
      key: 'payment_method',
      header: 'Payment',
      render: (bill) => bill.payment_method ? 
        bill.payment_method.replace('_', ' ').toUpperCase() : 
        'Not specified'
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
              Invoice {successModal.bill?.bill_number} has been created successfully!
            </h3>
            <p className="text-sm text-gray-500">
              For {successModal.bill?.billed_to} • {formatCurrency(successModal.bill?.total_amount || 0)}
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
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Invoices</h1>
                <p className="text-blue-100 mt-1">Create and manage professional invoices</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button onClick={handleCreate} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4" />
                Create Invoice
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
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputClassName="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Bills Table */}
        <Card className="overflow-hidden shadow-lg">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Invoices ({filteredBills.length})</h3>
              </div>
              <Table
                columns={columns}
                data={filteredBills}
                className="min-w-full"
              />
            </>
          )}
        </Card>

        {/* Invoice Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalMode === 'create' ? '🧾 Create Invoice' :
            modalMode === 'edit' ? '✏️ Edit Invoice' :
            '📄 Invoice Details'
          }
          size="lg"
        >
          {modalMode === 'view' ? (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">INVOICE</h3>
                    <p className="text-blue-700 font-medium">{selectedBill?.bill_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Issue Date</p>
                    <p className="text-sm font-medium">{new Date(selectedBill?.issued_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Invoice To:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p className="font-medium text-sm">{selectedBill?.billed_to}</p>
                    {selectedBill?.customer_address && (
                      <p className="text-xs text-gray-600">{selectedBill.customer_address}</p>
                    )}
                    {selectedBill?.customer_phone && (
                      <p className="text-xs text-gray-600">Phone: {selectedBill.customer_phone}</p>
                    )}
                    {selectedBill?.customer_email && (
                      <p className="text-xs text-gray-600">Email: {selectedBill.customer_email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Total Amount</h4>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedBill?.total_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {selectedBill?.bill_items && selectedBill.bill_items.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBill.bill_items.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                                {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.quantity} {item.unit}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total:</span>
                    <span className="font-medium">{formatCurrency(selectedBill?.subtotal || 0)}</span>
                  </div>
                  {selectedBill?.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount ({selectedBill.discount_percentage}%):</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedBill.discount_amount)}</span>
                    </div>
                  )}
                  {selectedBill?.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({selectedBill.tax_percentage}%):</span>
                      <span className="font-medium">{formatCurrency(selectedBill.tax_amount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Grand Total:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(selectedBill?.total_amount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedBill?.payment_method && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Payment Method</h4>
                    <p className="text-sm font-medium">{selectedBill.payment_method.replace('_', ' ').toUpperCase()}</p>
                    {selectedBill.payment_details && (
                      <p className="text-xs text-gray-600 mt-1">{selectedBill.payment_details}</p>
                    )}
                  </div>
                )}

                {selectedBill?.note && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Additional Notes</h4>
                    <p className="text-xs text-gray-700">{selectedBill.note}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handlePrint(selectedBill)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  onClick={() => handleDownloadPDF(selectedBill)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Invoice Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label="Invoice Number (Optional)"
                      name="bill_number"
                      value={formData.bill_number}
                      onChange={handleFormChange}
                      error={formErrors.bill_number}
                      placeholder="Leave empty to auto-generate"
                      disabled={modalMode === 'edit'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {modalMode === 'create' ? 'Leave empty to auto-generate unique number' : 'Cannot change invoice number'}
                    </p>
                  </div>
                  
                  <InputField
                    label="Customer Name"
                    name="billed_to"
                    value={formData.billed_to}
                    onChange={handleFormChange}
                    error={formErrors.billed_to}
                    required
                    placeholder="Customer or company name"
                  />
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <InputField
                      label="Customer Address (Optional)"
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleFormChange}
                      placeholder="Customer address"
                    />
                  </div>
                  
                  <InputField
                    label="Phone Number (Optional)"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleFormChange}
                    placeholder="Phone number"
                  />
                  
                  <InputField
                    label="Email Address (Optional)"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleFormChange}
                    placeholder="Email address"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Invoice Items</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBillItem}
                    className="text-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {formErrors.bill_items && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2">
                    <p className="text-sm text-red-600">{formErrors.bill_items}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.bill_items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-medium text-gray-700 flex items-center">
                          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          Item {index + 1}
                        </h5>
                        {formData.bill_items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBillItem(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <InputField
                            label="Description"
                            value={item.description}
                            onChange={(e) => updateBillItem(index, 'description', e.target.value)}
                            error={formErrors[`item_${index}_description`]}
                            required
                            placeholder="Describe the item or service"
                          />
                        </div>
                        
                        <div>
                          <InputField
                            label="Quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateBillItem(index, 'quantity', e.target.value)}
                            error={formErrors[`item_${index}_quantity`]}
                            required
                          />
                        </div>
                        
                        <div>
                          <CurrencyInput
                            label="Unit Price"
                            value={item.unit_price}
                            onChange={(e) => updateBillItem(index, 'unit_price', e.target.value)}
                            error={formErrors[`item_${index}_unit_price`]}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <InputField
                          label="Unit (Optional)"
                          value={item.unit}
                          onChange={(e) => updateBillItem(index, 'unit', e.target.value)}
                          placeholder="pc, kg, hr"
                        />
                        
                        <InputField
                          label="Notes (Optional)"
                          value={item.notes}
                          onChange={(e) => updateBillItem(index, 'notes', e.target.value)}
                          placeholder="Additional notes"
                        />
                      </div>
                      
                      <div className="mt-3 text-right">
                        <span className="text-sm text-gray-600">Line Total: </span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Invoice Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(calculateDiscount(calculateSubtotal()))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(calculateTax(calculateSubtotal(), calculateDiscount(calculateSubtotal())))}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Tax Percentage (%)"
                  name="tax_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_percentage}
                  onChange={handleFormChange}
                  placeholder="0.00"
                />
                
                <InputField
                  label="Discount Percentage (%)"
                  name="discount_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={handleFormChange}
                  placeholder="0.00"
                />
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="digital_wallet">Digital Wallet</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <InputField
                  label="Payment Details"
                  name="payment_details"
                  value={formData.payment_details}
                  onChange={handleFormChange}
                  placeholder="Reference number, details, etc."
                />
              </div>

              {/* Notes */}
              <InputField
                label="Additional Notes"
                name="note"
                value={formData.note}
                onChange={handleFormChange}
                placeholder="Terms, conditions, or additional information"
              />
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Processing...' : (modalMode === 'create' ? 'Create Invoice' : 'Update Invoice')}
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

export default BillsPage;
