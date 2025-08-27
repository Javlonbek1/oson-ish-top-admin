import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import AreaFormModal from "./components/AddEditAreaModal";
import DeleteConfirmModal from "../region/components/delete-modal";
import AreaTable from './components/AreaTable';
import { FaSync } from "react-icons/fa";
import { FaWifi } from "react-icons/fa6";


// GET Regions
const useRegions = () =>
  useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/region/read");
      return res.data.data || [];
    },
  });

// GET Areas
const useAreas = (regionId, searchTerm) =>
  useQuery({
    queryKey: ["areas", regionId, searchTerm],
    queryFn: async () => {
      const params = {};
      if (regionId && regionId !== "all") params.regionsId = regionId;
      if (searchTerm) params.search = searchTerm;
      const res = await axiosInstance.get("/areas/read", { params });
      return res.data.data || [];
    },
    keepPreviousData: true,
    enabled: true,
  });

// CREATE, UPDATE, DELETE hooks (avvalgi kabi)
const useCreateArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newArea) => axiosInstance.post("/areas/create", newArea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Hudud (area) muvaffaqiyatli qo‘shildi!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Hudud (area) qo‘shishda xatolik!"
      );
    },
  });
};

const useUpdateArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ areaId, updatedArea }) =>
      axiosInstance.put(`/areas/update/${areaId}`, updatedArea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Hudud (area) muvaffaqiyatli yangilandi!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Hudud (area) yangilashda xatolik!"
      );
    },
  });
};

const useDeleteArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (areaId) =>
      axiosInstance.delete(`/areas/delete/${areaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Hudud (area) muvaffaqiyatli o‘chirildi!");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Hudud (area) o‘chirishda xatolik!"
      );
    },
  });
};

const Area = () => {
  const { regionId: pathRegionId } = useParams();
  const [selectedRegionId, setSelectedRegionId] = useState(
    pathRegionId || "all"
  );
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    nameUz: "",
    nameEn: "",
    nameRu: "",
    regionsId: pathRegionId || "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: regions = [], isLoading: loadingRegions } = useRegions();
  const {
    data: areas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAreas(selectedRegionId, searchTerm);

  const { mutate: createArea, isLoading: isCreating } = useCreateArea();
  const { mutate: updateArea, isLoading: isUpdating } = useUpdateArea();
  const { mutate: deleteArea } = useDeleteArea();

  // Agar pathRegionId bo'lsa select va formData ni update qilamiz
  useEffect(() => {
    if (pathRegionId) {
      setSelectedRegionId(pathRegionId);
      setFormData((prev) => ({ ...prev, regionsId: pathRegionId }));
    }
  }, [pathRegionId]);

  // Modalda select uchun regions
  const availableRegions = pathRegionId
    ? regions.filter((r) => r.id === Number(pathRegionId))
    : regions;

  const resetModal = () => {
    setFormData({
      nameUz: "",
      nameEn: "",
      nameRu: "",
      regionsId: pathRegionId || "",
    });
    setEditingArea(null);
    setShowModal(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingArea) {
      updateArea({ areaId: editingArea.id, updatedArea: formData });
    } else {
      createArea(formData);
    }
    resetModal();
  };

  const handleEdit = (area) => {
    setFormData({
      nameUz: area.nameUz,
      nameEn: area.nameEn,
      nameRu: area.nameRu,
      regionsId: area.regionsId,
    });
    setEditingArea(area);
    setShowModal(true);
  };

  const handleDelete = (areaId) => {
    deleteArea(areaId);
    setDeleteConfirm(null);
  };

  const handleSearch = () => setSearchTerm(search);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") setSearchTerm(search);
  };

  if (isLoading || loadingRegions)
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
            onClick={() => refetch()} // qayta so‘rov yuborish uchun (React Query bo‘lsa)
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
        <div className="flex items-end gap-2 w-full sm:w-auto">
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            disabled={!!pathRegionId} // Agar path bo'lsa select o'zgarmas
            className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-48 focus:outline-none"
          >
            <option value="all">Barcha tumanlar</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nameUz}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Area qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-64 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Qidirish
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white max-w-[500px] sm:w-auto w-full cursor-pointer px-5 py-2 rounded-lg hover:bg-blue-600 active:scale-95 transition"
        >
          Tuman qo'shish
        </button>
      </div>
      <Link to="/region" className="text-blue-600 underline">
        Ortga qaytish
      </Link>

      {/* Modals */}
      <AreaFormModal
        show={showModal}
        onClose={resetModal}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        editingArea={editingArea}
        availableRegions={availableRegions}
      />

      <DeleteConfirmModal
        show={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
      />

      {/* Table */}

      <AreaTable
        areas={areas}
        regions={regions}
        handleEdit={handleEdit}
        setDeleteConfirm={setDeleteConfirm}
        edit={<FiEdit  size={20}/>}
        delate={<RiDeleteBin6Line size={20}/>}
      />
    </div>
  );
};

export default Area;
