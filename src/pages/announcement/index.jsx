import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit } from "react-icons/fi";
import { FaEllipsisV } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import AnnTypeFormModal from "./components/edit-modal";
import { FaWifi } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// 🔹 Custom hooks
const useAnnTypes = () =>
  useQuery({
    queryKey: ["annTypes"],
    queryFn: async () => {
      const res = await axiosInstance.get("/ann-types/read");
      return res.data.data || res.data;
    },
    keepPreviousData: true,
  });

const useUpdateAnnType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updatedData }) =>
      axiosInstance.put(`/ann-types/update/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annTypes"] });
      toast.success("Announcement type muvaffaqiyatli yangilandi!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Announcement type yangilashda xatolik!"
      );
    },
  });
};

// 🔹 Component
const AnnouncementTypes = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAnnType, setEditingAnnType] = useState(null);
  const [formData, setFormData] = useState({
    descriptionUz: "",
    descriptionEn: "",
    descriptionRu: "",
    pricePerDay: 0,
  });

  const [selectedAnnType, setSelectedAnnType] = useState(null); // 3 nuqta modal uchun

  const navigate = useNavigate();

  const { data: annTypes = [], isLoading, isError, refetch } = useAnnTypes();
  const { mutate: updateAnnType, isLoading: isUpdating } = useUpdateAnnType();

  const resetModal = () => {
    setFormData({
      descriptionUz: "",
      descriptionEn: "",
      descriptionRu: "",
      pricePerDay: 0,
      maxDay: 365
    });
    setEditingAnnType(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pricePerDay" || name === "maxDay" ? Number(value) : value,
    }));
  };

  const handleEdit = (annType) => {
    setFormData({
      descriptionUz: annType.descriptionUz,
      descriptionEn: annType.descriptionEn,
      descriptionRu: annType.descriptionRu,
      pricePerDay: annType.pricePerDay || 0,
      maxDay: annType.maxDay || 365
    });
    setEditingAnnType(annType);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingAnnType) return;
    updateAnnType({ id: editingAnnType.id, updatedData: formData });
    resetModal();
  };

  // 🔹 Custom sort (Premium → Comford → Standart)
  const order = ["Premium", "Comford", "Standart"];
  const sortedAnnTypes = [...annTypes].sort(
    (a, b) => order.indexOf(a.nameUz) - order.indexOf(b.nameUz)
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 h-[80vh]">
        <div className="bg-red-100 text-red-600 p-6 rounded-full shadow-lg mb-4">
          <FaWifi size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Xatolik yuz berdi
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Iltimos, birozdan so‘ng qayta urinib ko‘ring.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-xl shadow hover:bg-red-600 transition"
        >
          <FaSync className="animate-spin-slow" />
          Qayta urinib ko‘rish
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden rounded-xl p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">E'lon turlari</h2>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[550px] md:max-h-[60vh]">
        <table className="min-w-full table-auto text-sm whitespace-nowrap">
          <thead className="top-0 bg-white z-10 font-nunito border-b border-dashed border-gray-300">
            <tr className="text-gray-600 text-left text-sm">
              <th className="px-2 py-2">No</th>
              <th className="px-2 py-2">E'lon turi (UZ)</th>
              <th className="px-2 py-2">E'lon turi (EN)</th>
              <th className="px-2 py-2">E'lon turi (RU)</th>
              <th className="px-2 py-2">Bir kunlik narxi</th>
              <th className="px-2 py-2">maksimal kun</th>
              <th className="px-2 py-2">Boshqarish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedAnnTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              sortedAnnTypes.map((annType, idx) => (
                <tr
                  onClick={() => navigate(`/announcement/${annType.id}`)}
                  key={annType.id || idx}
                  className="hover:bg-gray-200 text-[12px] md:text-[14px]"
                >
                  <td className="px-2 py-2">{idx + 1}</td>
                  <td className="px-2 py-2">{annType.nameUz}</td>
                  <td className="px-2 py-2">{annType.nameEn}</td>
                  <td className="px-2 py-2">{annType.nameRu}</td>
                  <td className="px-2 py-2">{annType.pricePerDay} so'm</td>
                  <td className="px-2 py-2">{annType.maxDay} kun</td>
                  <td className="px-2 py-2 flex items-center gap-3">
                    {/* Edit */}
                    <button
                      onClick={(e) => {
                        handleEdit(annType);
                        e.stopPropagation();
                      }}
                      className="text-blue-500 hover:text-blue-700 hover:drop-shadow-xl drop-shadow-blue-700 transition-colors duration-300 cursor-pointer"
                    >
                      <FiEdit size={18} />
                    </button>
                    {/* 3 dots */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnType(annType);
                      }}
                      className="text-gray-600 cursor-pointer hover:text-black"
                    >
                      <FaEllipsisV size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnnTypeFormModal
        show={showModal}
        onClose={resetModal}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        editingAnnType={editingAnnType}
      />

      {/* 3 nuqta modal */}
      {selectedAnnType && (
        <div
          className="fixed inset-0 px-[20px] flex items-center justify-center bg-black/10 backdrop-filter-[12px] z-50"
          onClick={() => setSelectedAnnType(null)}
        >
          <div
            className="bg-white  rounded-xl shadow-lg p-6 w-[400px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">E'lon turi ma'lumotlari</h3>
              <button
                onClick={() => setSelectedAnnType(null)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2  text-sm">
              {Object.entries(selectedAnnType).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between border-b border-dashed py-1"
                >
                  <span className="font-medium text-gray-600">{key}</span>
                  <span className="text-gray-800 text-right max-w-[200px] truncate">
                    {Array.isArray(value)
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementTypes;
