import React from "react";

const DeleteModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed px-[20px] inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">
          O‘chirishni tasdiqlaysizmi?
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Ushbu ish turini o‘chirishni xohlaysizmi? Bu amalni qaytarib
          bo‘lmaydi.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 px-4 py-2 rounded cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer disabled:opacity-60"
          >
            {loading ? "O‘chirilmoqda..." : "O‘chirish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
