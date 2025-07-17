import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';

const ConfirmModal = ({ isOpen, title = 'Confirm', message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-800 text-base">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelText}</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
