// src/pages/categories/InnerCategoriesPage.jsx
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import FormModal from "./components/FormModal";
import DeleteModal from "./components/DeleteInnerModal";
import InnerCategoryTable from "./components/innerCategoryTable";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { FaWifi } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";

const getInnerCategories = async ({ queryKey }) => {
  const [, { parentId, page, size, search }] = queryKey;
  const res = await axiosInstance.get("/ann-job-categories/read", {
    params: { parentId, page, size, search },
  });

  const raw = res?.data ?? {};
  const data = raw?.data ?? raw;
  const content = data?.content ?? data?.items ?? data ?? [];
  const totalPages =
    typeof data?.totalPages === "number"
      ? data.totalPages
      : Array.isArray(content) && content.length < size
        ? page
        : page + 1;

  return { items: Array.isArray(content) ? content : [], totalPages };
};

const createCategory = async (payload) => {
  await axiosInstance.post("/ann-job-categories/create", payload);
};

const updateCategory = async ({ id, payload }) => {
  await axiosInstance.put(`/ann-job-categories/update/${id}`, payload);
};

const deleteCategory = async (id) => {
  await axiosInstance.delete(`/ann-job-categories/delete/${id}`);
};

const InnerCategoriesPage = () => {
  const { categoryId } = useParams();
  const parentIdNum = useMemo(() => Number(categoryId), [categoryId]);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({ nameUz: "", nameRu: "", nameEn: "" });
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  const { data, isLoading, isError, error , refetch } = useQuery({
    queryKey: [
      "innerCategories",
      { parentId: parentIdNum, page, size, search: searchQuery },
    ],
    queryFn: getInnerCategories,
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["innerCategories"]);
      setOpenForm(false);
      setForm({ nameUz: "", nameRu: "", nameEn: "" });
    },
  });

  const updateMut = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["innerCategories"]);
      setOpenForm(false);
      setEditing(null);
      setForm({ nameUz: "", nameRu: "", nameEn: "" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["innerCategories"]);
      setOpenDelete(false);
      setDeleteId(null);
    },
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const openAddModal = () => {
    setEditing(null);
    setForm({ nameUz: "", nameRu: "", nameEn: "" });
    setOpenForm(true);
  };

  const openEditModal = (cat) => {
    setEditing(cat);
    setForm({
      nameUz: cat?.nameUz || "",
      nameRu: cat?.nameRu || "",
      nameEn: cat?.nameEn || "",
      ordering: cat?.ordering || 0,
    });
    setOpenForm(true);
  };

  const submitForm = () => {
    const payload = {
      nameUz: form.nameUz,
      nameEn: form.nameEn,
      nameRu: form.nameRu,
      ordering: form.ordering,
      parentId: parentIdNum,
    };
    if (editing?.id) {
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteMut.mutate(deleteId);
  };


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
      {/* Top controls */}
      <div className="flex gap-[20px] justify-between items-center mb-4">
        <div className="flex w-full sm:w-auto">
          <input
            type="search"
            placeholder="Kategoriya qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-l-lg w-full sm:w-64 md:w-72 focus:outline-none transition"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition cursor-pointer"
            onClick={() => {
              setPage(1); // Qidirishda har doim 1-sahifadan boshlash
              setSearchQuery(searchTerm.trim());
            }}
          >
            <IoSearch size={20} />
          </button>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-500 cursor-pointer text-white px-5 py-2 rounded-lg hover:bg-blue-600"
        >
          <span className="hidden sm:flex">Qo‘shish</span>
          <span className="sm:hidden text-[18px]">+</span>
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-32">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-red-500 text-center">
          Error: {error?.message || "Xatolik yuz berdi"}
        </div>
      ) : (
        <InnerCategoryTable
          items={items}
          askDelete={askDelete}
          page={page}
          size={size}
          openEditModal={openEditModal}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded disabled:opacity-50 border cursor-pointer"
          >
            <GrFormPreviousLink />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded disabled:opacity-50 border cursor-pointer"
          >
            <GrFormNextLink />
          </button>
        </div>
      )}

      {/* Modals */}
      <FormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={submitForm}
        form={form}
        setForm={setForm}
        loading={createMut.isLoading || updateMut.isLoading}
        isEdit={!!editing}
      />

      <DeleteModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        loading={deleteMut.isLoading}
      />
    </div>
  );
};

export default InnerCategoriesPage;
