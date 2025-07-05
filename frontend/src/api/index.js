import Base from './base.js';

// Authentication APIs
export const authAPI = {
  login: (credentials) => Base.post('/accounts/login/', credentials, false),
  register: (userData) => Base.post('/accounts/register/', userData),
  getProfile: () => Base.get('/accounts/profile/'),
  updateProfile: (data) => Base.put('/accounts/update-profile/', data),
  changePassword: (data) => Base.post('/accounts/change-password/', data),
  deleteUser: (email) => Base.delete(`/accounts/delete-user/`, { email }),
  getUsers: () => Base.get('/accounts/user/'),
};

// Transaction APIs
export const transactionAPI = {
  getTransactions: () => Base.get('/transactions/'),
  createTransaction: (data) => Base.post('/transactions/create/', data),
  getTransactionDetail: (id) => Base.get(`/transactions/details/${id}/`),
  updateTransaction: (id, data) => Base.put(`/transactions/update/${id}/`, data),
  deleteTransaction: (id) => Base.delete(`/transactions/delete/${id}/`),
  getTransactionSummary: () => Base.get('/transactions/summary/'),
};

// Billing APIs
export const billingAPI = {
  getBills: () => Base.get('/bills/'),
  createBill: (data) => Base.post('/bills/', data),
  getBillDetail: (id) => Base.get(`/bills/${id}/`),
  updateBill: (id, data) => Base.put(`/bills/${id}/update/`, data),
  deleteBill: (id) => Base.delete(`/bills/${id}/`),
  getBillPDF: (id) => Base.get(`/bills/${id}/pdf/`),
};

export default {
  auth: authAPI,
  transactions: transactionAPI,
  billing: billingAPI,
};
