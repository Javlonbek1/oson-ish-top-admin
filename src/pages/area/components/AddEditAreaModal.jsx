import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";

const fetchRegions = async () => {
  const res = await axiosInstance.get("/region/read");
  return res.data.data || res.data;
};

const AreaFormModal = ({
  show,
  onClose,
  formData,
  onChange,
  onSubmit,
  isLoading,
  editingArea,
  fixedRegionId, // path orqali keladigan regionId
}) => {
  const { data: regions = [], isLoading: isRegionsLoading } = useQuery({
    queryKey: ["regions-dropdown"],
    queryFn: fetchRegions,
  });

  const modalRef = useRef(null);

  if (!show) return null;

  // Agar fixedRegionId bo‘lsa, faqat shu region
  const availableRegions = fixedRegionId
    ? regions.filter((r) => r.id === Number(fixedRegionId))
    : regions;

  // Tashqi qism bosilganda modalni yopish
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/10 px-[20px]  backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingArea ? "Hududni tahrirlash" : "Hudud qo'shish"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name UZ */}
          <div>
            <label className="block text-gray-700 mb-1">Hudud nomi (UZ)</label>
            <input
              type="text"
              name="nameUz"
              value={formData.nameUz}
              onChange={onChange}
              placeholder="Hudud nomi (UZ)"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none"
            />
          </div>

          {/* Name EN */}
          <div>
            <label className="block text-gray-700 mb-1">Hudud nomi (EN)</label>
            <input
              type="text"
              name="nameEn"
              value={formData.nameEn}
              onChange={onChange}
              placeholder="Hudud nomi (EN)"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none"
            />
          </div>

          {/* Name RU */}
          <div>
            <label className="block text-gray-700 mb-1">Hudud nomi (RU)</label>
            <input
              type="text"
              name="nameRu"
              value={formData.nameRu}
              onChange={onChange}
              placeholder="Hudud nomi (RU)"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none"
            />
          </div>

          {/* Regions Select */}
          <div>
            <label className="block text-gray-700 mb-1">Region tanlang</label>
            <select
              name="regionsId"
              value={formData.regionsId}
              onChange={onChange}
              required
              disabled={!!fixedRegionId}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none"
            >
              {isRegionsLoading ? (
                <option disabled>Yuklanmoqda...</option>
              ) : (
                availableRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nameUz}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading
                ? "Saqlanmoqda..."
                : editingArea
                  ? "Yangilash"
                  : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaFormModal;
