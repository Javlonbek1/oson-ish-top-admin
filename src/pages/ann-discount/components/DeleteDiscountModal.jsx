import React, { useRef } from "react";

const DeleteDiscountModal = ({ item, typeName, onClose, onDelete }) => {
  const deleteModalRef = useRef();

  const handleBackdropClick = (e) => {
    if (deleteModalRef.current && !deleteModalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed z-20 inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div ref={deleteModalRef} className="bg-white p-6 rounded w-96 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Rostan ham <span className="font-bold text-blue-500">{typeName}</span>{" "}
          turidagi,
          <span className="font-bold text-green-500">
            {" "}
            {item?.fixedDay} kunlik
          </span>
          ,<span className="font-bold text-red-500"> {item?.discount}%</span>{" "}
          chegirmali elonni o‘chirmoqchimisiz?
        </h3>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 cursor-pointer py-2 bg-gray-300 rounded"
          >
            Bekor qilish
          </button>
          <button
            onClick={onDelete}
            className="px-4  py-2 cursor-pointer bg-red-500 text-white rounded"
          >
            O‘chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountModal;
