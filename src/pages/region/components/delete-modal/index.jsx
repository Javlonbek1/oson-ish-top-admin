import React from "react";
import ModalBase from "../../../../components/modal";

const DeleteConfirmModal = ({ show, onClose, onConfirm }) => (
  <ModalBase show={show} onClose={onClose}>
    <h2 className="text-lg font-semibold text-[#212529] mb-4">
      Hududni o'chirish
    </h2>
    <p className="mb-6 text-gray-700">
      Siz rostdan ham bu hududni o'chirmoqchimisiz?
    </p>
    <div className="flex justify-end gap-2">
      <button
        onClick={onClose}
        className="bg-white text-[#333333] py-2 px-6 rounded hover:bg-gray-200 transition duration-200"
      >
        Bekor qilish
      </button>
      <button
        onClick={onConfirm}
        className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600 transition duration-200"
      >
        O'chirish
      </button>
    </div>
  </ModalBase>
);

export default DeleteConfirmModal;
