import React, { useRef } from "react";

const AddEditDiscountModal = ({
  annTypes,
  formData,
  setFormData,
  onClose,
  onSubmit,
}) => {
  const modalRef = useRef();

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed px-[20px] inset-0 bg-black/10 backdrop-blur-sm z-10 flex items-center justify-center animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <form
        ref={modalRef}
        className="bg-white max-w-[468px] w-full flex flex-col gap-4 p-6 rounded shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h3 className="text-lg font-semibold mb-4">
          {formData.id ? "Chegirma tahrirlash" : "Chegirma qo‘shish"}
        </h3>
        <div>
          <label className="text-[15px] mb-2" htmlFor="type">
            Elon turi
          </label>
          <select
            id="type"
            value={formData.annTypesId}
            onChange={(e) =>
              setFormData({ ...formData, annTypesId: e.target.value })
            }
            className="w-full py-[10px] px-[16px] bg-[#F0F2F2] rounded-md border text-[16px] outline-none"
          >
            <option value={0}>Tanlang</option>
            {annTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nameUz}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[15px] mb-2" htmlFor="day">
            Necha kun
          </label>
          <input
            id="day"
            type="number"
            min="0"
            value={formData.fixedDay}
            onChange={(e) =>
              setFormData({ ...formData, fixedDay: e.target.value })
            }
            className="w-full py-[10px] px-[16px] bg-[#F0F2F2] rounded-md border text-[16px] outline-none"
          />
        </div>
        <div>
          <label className="text-[15px] mb-2" htmlFor="dis">
            Chegirma
          </label>
          <input
            id="dis"
            type="number"
            min="0"
            value={formData.discount}
            onChange={(e) =>
              setFormData({ ...formData, discount: e.target.value })
            }
            className="w-full py-[10px] px-[16px] bg-[#F0F2F2] rounded-md border text-[16px] outline-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-white cursor-pointer text-[#333333] py-2 px-6 rounded hover:bg-gray-200"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="bg-blue-500 cursor-pointer text-white py-2 px-6 rounded hover:bg-blue-600"
          >
            Saqlash
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditDiscountModal;
