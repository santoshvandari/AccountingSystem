import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Table from '../components/Table/Table';
import Modal from '../components/Modal/Modal';
import InputField from '../components/InputField/InputField';
import Select from '../components/Select/Select';
import Loading from '../components/Loading/Loading';
import Alert from '../components/Alert/Alert';
import Toast from '../components/Toast/Toast';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import { Plus, Edit, Trash2, Eye, Search, UserCheck, UserX } from 'lucide-react';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    phone_number: '',
    role: 'cashier',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [confirmState, setConfirmState] = useState({ open: false, user: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, visible: true, duration });
  };

  const handleCloseToast = () => setToast(t => ({ ...t, visible: false }));

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' }
  ];

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      email: '',
      username: '',
      full_name: '',
      phone_number: '',
      role: 'cashier',
      password: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone_number: user.phone_number || '',
      role: user.role,
      password: '' // Don't prefill password for security
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (user.email === currentUser.email) {
      showToast('You cannot delete your own account', 'error');
      return;
    }
    setConfirmState({ open: true, user });
  };

  const handleConfirmDelete = async () => {
    const user = confirmState.user;
    setConfirmLoading(true);
    try {
      await authAPI.deleteUser(user.email);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast(`User "${user.full_name}" has been deleted successfully`, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      showToast(`Failed to delete user: ${errorMessage}`, 'error');
      console.error('Delete user error:', err);
    } finally {
      setConfirmLoading(false);
      setConfirmState({ open: false, user: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }

    if (modalMode === 'create' && !formData.password.trim()) {
      errors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
        const response = await authAPI.register(formData);
        await fetchUsers(); // Refresh the list
        showToast('User created successfully', 'success');
      } else {
        // For updates, we would need an update endpoint in the backend
        showToast('User update functionality needs backend endpoint', 'warning');
      }
      setShowModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      showToast(`Failed to ${modalMode} user: ${errorMessage}`, 'error');
      console.error(`${modalMode} user error:`, err);
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

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'full_name',
      header: 'Full Name'
    },
    {
      key: 'email',
      header: 'Email'
    },
    {
      key: 'username',
      header: 'Username'
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (user) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.is_active ? (
            <>
              <UserCheck className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <UserX className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (user) => user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(user)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(user)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {user.email !== currentUser.email && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(user)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (currentUser?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Alert
            type="error"
            title="Access Denied"
            message="You need admin privileges to access this page."
          />
        </div>
      </DashboardLayout>
    );
  }

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
        title="Delete User"
        message={`Are you sure you want to delete user: ${confirmState.user?.full_name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, user: null })}
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmLoading}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <Button onClick={handleCreate} className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add User
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

        {/* Search */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <InputField
                placeholder="Search users..."
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

        {/* Users Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="lg" />
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredUsers}
              className="min-w-full"
            />
          )}
        </Card>

        {/* User Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalMode === 'create' ? 'Add User' :
            modalMode === 'edit' ? 'Edit User' :
            'User Details'
          }
          size="md"
        >
          {modalMode === 'view' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.phone_number || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser?.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                error={formErrors.full_name}
                required
              />
              
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={formErrors.email}
                required
                disabled={modalMode === 'edit'}
              />
              
              <InputField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                error={formErrors.username}
                required
                disabled={modalMode === 'edit'}
              />
              
              <InputField
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleFormChange}
                placeholder="Optional"
              />
              
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                options={roleOptions}
                error={formErrors.role}
                required
              />
              
              <InputField
                label={modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                error={formErrors.password}
                required={modalMode === 'create'}
                placeholder={modalMode === 'edit' ? 'Leave blank to keep current password' : ''}
              />
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                >
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
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

export default UsersPage;
