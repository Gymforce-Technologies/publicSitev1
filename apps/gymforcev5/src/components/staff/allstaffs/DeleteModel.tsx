import React from 'react';
import { Button, Modal } from 'rizzui';

const DeleteConfirmModal = ({ isOpen,onCancel, onConfirm,deleting }:{onCancel:any,onConfirm:any,deleting:boolean,isOpen:boolean}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
    <div className="text-white p-6 rounded-lg shadow-lg  w-full">
      <h2 className="text-2xl mb-4">Delete Confirmation</h2>
      <p className="mb-4">Are you sure you want to delete this item?</p>
      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
        
        >
         Delete
        </Button>
      </div>
    </div>
  </Modal>
  );
};

export default DeleteConfirmModal;
