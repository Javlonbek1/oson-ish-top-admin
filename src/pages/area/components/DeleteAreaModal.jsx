import React from "react";

const AreaDeleteModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">O‘chirishni tasdiqlash</h2>
        <p className="text-gray-600 mb-6">
          Ushbu hududni o‘chirishga ishonchingiz komilmi? Ushbu amalni ortga
          qaytarib bo‘lmaydi.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            O‘chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaDeleteModal;
