import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { FaWifi } from "react-icons/fa6";
import { FaSync } from "react-icons/fa";
import AddsTable from "./components/AddsTable";

// ===== API =====
const getAds = async ({ queryKey }) => {
  const [_key, { page, size, filter }] = queryKey;
  const res = await axiosInstance.get("/ads/read", {
    params: { page, size, filter },
  });
  return res.data.data || res.data;
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("/file/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data; // resourcesId
};

const createAdApi = async (payload) =>
  axiosInstance.post("/ads/create", payload);
const updateAdApi = async ({ id, payload }) =>
  axiosInstance.put(`/ads/update/${id}`, payload);
const deleteAdApi = async (id) => axiosInstance.delete(`/ads/delete/${id}`);

// ===== COMPONENT =====
const AdsPage = () => {
  const [page, setPage] = useState(1);
  const size = 20;
  const [filter, setFilter] = useState("ALL"); // API filter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fixedDay, setFixedDay] = useState(null);
  const [link, setLink] = useState("");
  const [destination, setDestination] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // preview modal uchun
  const modalRef = useRef(null);

  const queryClient = useQueryClient();

  // ===== Fetch ads =====
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ads", { page, size, filter }],
    queryFn: getAds,
    keepPreviousData: true,
  });

  // ===== File preview =====
  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ===== Mutations =====
  const createOrUpdateAdMutation = useMutation({
    mutationFn: async () => {
      let resourcesId = editingAd?.resourcesId;

      // Yangi qo‘shishda rasm majburiy
      if (!editingAd && !file) {
        throw new Error("Rasm majburiy!");
      }

      if (file) {
        resourcesId = await uploadFile(file);
      }

      const payload = {
        resourcesId,
        link,
        destination, // modal ichidan keladi
      };

      if (!editingAd) {
        // create
        payload.fixedDay = fixedDay;
      } else if (fixedDay !== null) {
        // edit → agar kiritilgan bo‘lsa yangilanadi
        payload.fixedDay = fixedDay;
      }

      if (editingAd) return updateAdApi({ id: editingAd.id, payload });
      return createAdApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ads"]);
      closeModal();
      alert(editingAd ? "Reklama yangilandi!" : "Reklama yaratildi!");
    },
    onError: (err) => alert("Xatolik: " + err.message),
  });

  const deleteAdMutation = useMutation({
    mutationFn: deleteAdApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["ads"]);
      alert("Reklama o'chirildi!");
    },
    onError: (err) => alert("Xatolik: " + err.message),
  });

  // ===== Handlers =====
  const handleEdit = (ad) => {
    setEditingAd(ad);
    setLink(ad.link);
    setFixedDay(ad?.fixedDay);
    setDestination(ad?.destination ?? false);
    setFile(null);
    setFilePreview(
      `https://api.osonishtop.uz/api/v1/file/download/${ad.resourcesId}`
    );
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      deleteAdMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
    setFile(null);
    setFilePreview(null);
    setLink("");
    setFixedDay(null);
    setDestination(false);
  };

  // Click outside modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target))
        closeModal();
    };
    if (isModalOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const items = data?.content || [];

  // ===== Helper =====
  const isAdActive = (ad) => {
    if (ad.fixedDay <= 0) return false; // fixedDay 0 yoki manfiy bo‘lsa inactive

    const created = new Date(ad.createdDate).getTime();
    const expiresAt = created + ad.fixedDay * 24 * 60 * 60 * 1000;

    return Date.now() <= expiresAt;
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
      {/* Header + Filter */}
      <div className="flex items-end justify-between  mb-4 gap-2">
        <h2 className="text-xl font-semibold">E’lonlar</h2>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-none shadow-sm outline-none p-2 rounded cursor-pointer"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 w-[41px] sm:w-auto h-[41px] flex items-center justify-center rounded cursor-pointer"
          >
            <span className="hidden sm:flex">Reklama qo‘shish</span>
            <span className="sm:hidden text-[24px]">+</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-32">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <AddsTable
          items={items}
          page={page}
          size={size}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          isAdActive={isAdActive}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-4 flex-wrap">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
        >
          Oldingi
        </button>
        <span>
          {page} / {data?.totalPages || 1}
        </span>
        <button
          disabled={page === (data?.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
        >
          Keyingi
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div
            ref={modalRef}
            className="bg-white rounded-lg w-full max-w-md p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <AiOutlineClose size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingAd ? "Reklamani tahrirlash" : "Reklama qo‘shish"}
            </h3>

            {/* Fayl tanlash */}
            {!filePreview && (
              <input
                type="file"
                required={!editingAd}
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="border p-2 w-full mb-3 outline-none"
              />
            )}
            {filePreview && (
              <div className="relative mb-3">
                <img
                  src={filePreview}
                  alt="preview"
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 cursor-pointer"
                >
                  <AiOutlineClose size={16} />
                </button>
              </div>
            )}

            {/* Fixed Day */}
            {editingAd ? (
              ""
            ) : (
              <input
                type="number"
                value={fixedDay ?? ""}
                onChange={(e) => setFixedDay(Number(e.target.value))}
                placeholder="Fixed Day"
                className="border p-2 w-full mb-3 outline-none"
                required={!editingAd}
              />
            )}

            {/* Link */}
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link"
              className="border p-2 w-full mb-3 outline-none"
            />

            {/* Destination */}
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={destination}
                onChange={(e) => setDestination(e.target.checked)}
              />
              <span>Destination</span>
            </label>

            <div className="flex justify-end gap-2 flex-wrap">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => createOrUpdateAdMutation.mutate()}
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <div
            className="relative max-w-3xl w-full p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="preview"
              className="w-full max-h-[80vh] object-contain rounded"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsPage;
