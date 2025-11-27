import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoSearch } from "react-icons/io5";

import axiosInstance from "../../api/axiosInstance";
import CategoryTable from "./components/CategoryTable";
import CategoryModal from "./components/CategoryModal";
import DeleteModal from "./components/DeleteModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaWifi } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";

// API funksiyalar
const getCategories = async (searchTerm) => {
  const res = await axiosInstance.get(
    `/ann-job-categories/read-parents?search=${encodeURIComponent(searchTerm || "")}`
  );
  return res.data.data || res.data;
};

const createCategory = (payload) =>
  axiosInstance
    .post("/ann-job-categories/create-parent", payload)
    .then((res) => res.data);

const updateCategory = ({ id, payload }) =>
  axiosInstance
    .put(`/ann-job-categories/update-parent/${id}`, payload)
    .then((res) => res.data);

const deleteCategory = (id) =>
  axiosInstance
    .delete(`/ann-job-categories/delete/${id}`)
    .then((res) => res.data);

const CategoryPage = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ nameUz: "", nameEn: "", nameRu: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const open = localStorage.getItem("open")
  // Fetch categories
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["jobCategories", searchTerm],
    queryFn: () => getCategories(searchTerm),
    keepPreviousData: true,
  });

  // Create mutation
  const { mutate: createMutate, isLoading: isSaving } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["jobCategories"]);
      resetForm();
      toast.success("Kategoriya muvaffaqiyatli qo‘shildi");
    },
    onError: () => {
      toast.error("Kategoriya qo‘shishda xatolik ");
    },
  });

  // Update mutation
  const { mutate: updateMutate, isLoading: isUpdating } = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["jobCategories"]);
      resetForm();
      toast.success("Kategoriya muvaffaqiyatli yangilandi ");
    },
    onError: () => {
      toast.error("Kategoriya yangilashda xatolik ");
    },
  });

  // Delete mutation
  const { mutate: deleteMutate, isLoading: isDeleting } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["jobCategories"]);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      toast.success("Kategoriya o‘chirildi ");
    },
    onError: () => {
      toast.error("Kategoriya o‘chirishda xatolik ");
    },
  });

  // Reset form helper
  const resetForm = () => {
    setForm({ nameUz: "", nameEn: "", nameRu: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  // Handlers
  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      nameUz: category.nameUz,
      nameEn: category.nameEn,
      nameRu: category.nameRu,
      ordering: category.ordering,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutate({ id: editingId, payload: form });
    } else {
      createMutate(form);
    }
  };

  return (
    <div className="bg-white overflow-hidden rounded-xl p-4">
      {/* Search & Add */}
      <div className="flex justify-between gap-[10px]  items-center mb-4">
        <div className="flex w-full sm:w-auto">
          <input
            type="search"
            placeholder="Kategoriya qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-l-lg w-full sm:max-w-64 md:w-72 focus:outline-none transition"
          />
          <button
            className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded-r-lg hover:bg-blue-600 transition transform shadow-md"
            onClick={() => setSearchTerm(searchTerm.trim())}
          >
            <IoSearch size={20}/>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm({ nameUz: "", nameEn: "", nameRu: "" });
            setIsModalOpen(true);
          }}
          className="bg-blue-500  sm:max-w-[200px] px-3 sm:w-full flex items-center h-[41px] w-[41px] justify-center whitespace-nowrap cursor-pointer text-white  rounded-lg hover:bg-blue-600"
        >
          <span className="hidden sm:flex">Kategoriya qo‘shish</span>
          <span className="sm:hidden text-[24px]">+</span>
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
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
            
          
      ) : (
        <CategoryTable
          categories={categories}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        loading={isSaving || isUpdating}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutate(deleteId)}
        loading={isDeleting}
      />
    </div>
  );
};

export default CategoryPage;
