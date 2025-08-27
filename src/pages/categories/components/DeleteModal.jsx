import React, { memo } from "react";
import Modal from "./Modal";

const DeleteModal = memo(({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <h2 className="text-lg font-bold mb-4">O‘chirish</h2>
      <p>Haqiqatan ham ushbu kategoriyani o‘chirmoqchimisiz?</p>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 cursor-pointer bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600"
        >
          {loading ? "O‘chirilmoqda..." : "O‘chirish"}
        </button>
      </div>
    </Modal>
  );
});

export default DeleteModal;
