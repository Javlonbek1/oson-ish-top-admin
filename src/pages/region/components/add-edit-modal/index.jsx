import React from "react";
import ModalBase from "../../../../components/modal";

const RegionFormModal = ({
  show,
  onClose,
  formData,
  onChange,
  onSubmit,
  isLoading,
  editingRegion,
}) => (
  <ModalBase show={show} onClose={onClose}>
    <h2 className="text-lg font-semibold text-[#212529] mb-4">
      {editingRegion ? "Hududni tahrirlash" : "Yangi hudud qo'shish"}
    </h2>

    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      {["Uz", "En", "Ru"].map((lang) => (
        <div key={lang} className="w-full">
          <h4 className="font-normal text-black text-[15px] mb-2">
            Hudud nomi ({lang})
          </h4>
          <input
            type="text"
            name={`name${lang}`}
            placeholder={`Hudud nomi (${lang})`}
            value={formData[`name${lang}`]}
            onChange={onChange}
            className={`w-full py-[10px] px-[16px] bg-[#F0F2F2] rounded-md border text-[16px] outline-none transition-all duration-200`}
            required
          />
        </div>
      ))}

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-white text-[#333333] py-2 px-6 rounded hover:bg-gray-200 transition duration-200"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition duration-200"
        >
          {isLoading
            ? editingRegion
              ? "Yangilanmoqda..."
              : "Qo‘shilmoqda..."
            : editingRegion
              ? "Yangilash"
              : "Qo‘shish"}
        </button>
      </div>
    </form>
  </ModalBase>
);

export default RegionFormModal;
