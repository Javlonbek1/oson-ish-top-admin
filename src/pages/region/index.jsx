import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit, FiEye } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";

import axiosInstance from "../../api/axiosInstance";
import RegionFormModal from "./components/add-edit-modal";
import DeleteConfirmModal from "./components/delete-modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaSync } from "react-icons/fa";
import { FaWifi } from "react-icons/fa6";

// 🔹 Custom hooks
const useRegions = (searchTerm) =>
  useQuery({
    queryKey: ["regions", searchTerm],
    queryFn: async () => {
      const res = await axiosInstance.get("/region/read", {
        params: { search: searchTerm },
      });
      return res.data.data || res.data;
    },
    keepPreviousData: true,
  });

const useCreateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRegion) =>
      axiosInstance.post("/region/create", newRegion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Hudud muvaffaqiyatli qo‘shildi!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Hudud qo‘shishda xatolik!");
    },
  });
};

const useUpdateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ regionId, updatedRegion }) =>
      axiosInstance.put(`/region/update/${regionId}`, updatedRegion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Hudud muvaffaqiyatli yangilandi!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Hududni yangilashda xatolik!"
      );
    },
  });
};

const useDeleteRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (regionId) =>
      axiosInstance.delete(`/region/delete/${regionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Hudud muvaffaqiyatli o‘chirildi!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Hududni o‘chirishda xatolik!"
      );
    },
  });
};

// 🔹 Region component
const Region = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [formData, setFormData] = useState({
    nameUz: "",
    nameEn: "",
    nameRu: "",
  });
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 🔹 yangi state — dropdown va katta modal
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const {
    data: regions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRegions(searchTerm);
  const { mutate: createRegion, isLoading: isCreating } = useCreateRegion();
  const { mutate: updateRegion, isLoading: isUpdating } = useUpdateRegion();
  const { mutate: deleteRegion } = useDeleteRegion();

  const resetModal = () => {
    setFormData({ nameUz: "", nameEn: "", nameRu: "" });
    setEditingRegion(null);
    setShowModal(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRegion) {
      updateRegion({ regionId: editingRegion.id, updatedRegion: formData });
    } else {
      createRegion(formData);
    }
    resetModal();
  };

  const handleEdit = (region) => {
    setFormData({
      nameUz: region.nameUz,
      nameEn: region.nameEn,
      nameRu: region.nameRu,
    });
    setEditingRegion(region);
    setShowModal(true);
  };

  const handleDelete = (regionId) => {
    deleteRegion(regionId);
    setDeleteConfirm(null);
  };

  const handleSearch = () => setSearchTerm(search);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") setSearchTerm(search);
  };

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {/* Search & Add */}
      <div className="mb-6 flex justify-between flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex w-full sm:w-auto">
          <input
            type="search"
            placeholder="Hudud qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border border-gray-300 px-3 py-2 rounded-l-lg w-full sm:w-64 md:w-74 lg:w-84 focus:outline-none transition"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded-r-lg hover:bg-blue-600 transition transform shadow-md"
          >
            Qidirish
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white max-w-[500px] sm:w-auto w-full cursor-pointer px-5 py-2 rounded-lg hover:bg-blue-600 active:scale-95 transition transform shadow-md"
        >
          Hudud qo'shish
        </button>
      </div>

      {/* Modallar */}
      <RegionFormModal
        show={showModal}
        onClose={resetModal}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        editingRegion={editingRegion}
      />

      <DeleteConfirmModal
        show={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
      />

      <div className="overflow-auto pb-[100px] max-h-[550px] md:max-h-[700vh]">
        <table className="min-w-full  table-auto text-sm whitespace-nowrap">
          <thead className=" bg-white z-[1] font-nunito border-b border-dashed border-gray-300">
            <tr>
              <th
                colSpan="6"
                className="text-right px-4 pt-2 font-normal text-sm text-gray-800 underline"
              >
                Hududlar soni: ({regions?.length})
              </th>
            </tr>
            <tr className="text-gray-600  text-left text-sm">
              <th className="px-2 py-2">No</th>
              <th className="px-2 py-2">Hudud nomi (UZ)</th>
              <th className="px-2 py-2">Hudud nomi (EN)</th>
              <th className="px-2 py-2">Hudud nomi (RU)</th>
              <th className="px-2 py-2">Boshqarish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {regions.length > 0 ? (
              regions.map((region, idx) => (
                <tr
                  key={region.id || region.nameUz}
                  className="hover:bg-gray-200 text-[12px] md:text-[14px] cursor-pointer"
                  onClick={() => navigate(`/region/${region.id}`)}
                >
                  <td className="px-2 py-2">{idx + 1}</td>
                  <td className="px-2 py-2">{region.nameUz}</td>
                  <td className="px-2 py-2">{region.nameEn}</td>
                  <td className="px-2 py-2">{region.nameRu}</td>
                  <td
                    className="px-2 py-2 flex gap-2 justify-center relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(region)}
                      className="text-blue-500 hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                    >
                      <FiEdit size={20} />
                    </button>

                    {/* 3 nuqta */}
                    <button
                      onClick={() => toggleDropdown(region.id)}
                      className="p-1 cursor-pointer rounded-full hover:bg-gray-200"
                    >
                      <BsThreeDotsVertical size={18} />
                    </button>

                    {/* Kichik modal */}
                    {dropdownOpenId === region.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute flex gap-[5px] border-none overflow-hidden right-10 sm:right-36 sm:-mt-2 w-20 sm:w-24 bg-white border rounded-lg shadow-md z-50"
                      >
                        <button
                          onClick={() => {
                            setSelectedItem(region);
                            setDropdownOpenId(null);
                          }}
                          className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FiEye size={24} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm(region.id);
                            setDropdownOpenId(null);
                          }}
                          className="flex cursor-pointer  items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full text-left text-red-600"
                        >
                          <RiDeleteBin6Line size={24} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 font-medium cursor-default"
                >
                  Malumot topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Katta modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-black/10 px-[20px] flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg p-6 w-96"
          >
            <h2 className="text-xl font-semibold mb-4">Hudud ma’lumotlari</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">ID:</span> {selectedItem.id}
              </p>
              <p>
                <span className="font-semibold">Nomi:</span> {selectedItem.name}
              </p>
              <p>
                <span className="font-semibold">Hudud (Uz):</span>{" "}
                {selectedItem.nameUz}
              </p>
              <p>
                <span className="font-semibold">Hudud (En):</span>{" "}
                {selectedItem.nameEn}
              </p>
              <p>
                <span className="font-semibold">Hudud (Ru):</span>{" "}
                {selectedItem.nameRu}
              </p>
              <p>
                <span className="font-semibold">Yaratilgan:</span>{" "}
                {new Date(selectedItem.createdDate).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Region;
