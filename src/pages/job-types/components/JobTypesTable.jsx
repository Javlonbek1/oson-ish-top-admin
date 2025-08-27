// src/pages/JobTypes/JobTypesPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import FormModal from "./components/FormModal";
import DeleteModal from "./components/DeleteModal";

// API
const getJobTypes = async () => {
  const res = await axiosInstance.get("/ann-job-types/read");
  return res.data.data || [];
};

const createJobType = (payload) =>
  axiosInstance.post("/ann-job-types/create", payload).then((res) => res.data);

const updateJobType = ({ id, payload }) =>
  axiosInstance
    .put(`/ann-job-types/update/${id}`, payload)
    .then((res) => res.data);

const deleteJobType = (id) =>
  axiosInstance.delete(`/ann-job-types/delete/${id}`).then((res) => res.data);

const JobTypesPage = () => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    nameUz: "",
    nameEn: "",
    nameRu: "",
    isThereTrialPeriod: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch
  const { data: jobTypes = [], isLoading } = useQuery({
    queryKey: ["jobTypes"],
    queryFn: getJobTypes,
    keepPreviousData: true,
  });

  // Mutations
  const { mutate: createMutate, isLoading: isSaving } = useMutation({
    mutationFn: createJobType,
    onSuccess: () => {
      queryClient.invalidateQueries(["jobTypes"]);
      resetForm();
      toast.success("Job type qo‘shildi");
    },
    onError: () => toast.error("Qo‘shishda xatolik"),
  });

  const { mutate: updateMutate, isLoading: isUpdating } = useMutation({
    mutationFn: updateJobType,
    onSuccess: () => {
      queryClient.invalidateQueries(["jobTypes"]);
      resetForm();
      toast.success("Job type yangilandi");
    },
    onError: () => toast.error("Yangilashda xatolik"),
  });

  const { mutate: deleteMutate, isLoading: isDeleting } = useMutation({
    mutationFn: deleteJobType,
    onSuccess: () => {
      queryClient.invalidateQueries(["jobTypes"]);
      setIsDeleteModalOpen(false);
      toast.success("Job type o‘chirildi");
    },
    onError: () => toast.error("O‘chirishda xatolik"),
  });

  // Helpers
  const resetForm = () => {
    setForm({
      nameUz: "",
      nameEn: "",
      nameRu: "",
      isThereTrialPeriod: false,
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      nameUz: item.nameUz,
      nameEn: item.nameEn,
      nameRu: item.nameRu,
      isThereTrialPeriod: item.isThereTrialPeriod,
    });
    setIsModalOpen(true);
  };

  const askDelete = (id) => {
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
      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              nameUz: "",
              nameEn: "",
              nameRu: "",
              isThereTrialPeriod: false,
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          Job type qo‘shish
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-40">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-auto max-h-[550px] md:max-h-[60vh]">
          <table className="min-w-full table-auto text-sm whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10 font-nunito border-b border-dashed border-gray-300">
              <tr className="text-gray-600 text-left text-sm">
                <th className="px-2 py-2">No</th>
                <th className="px-2 py-2">Sarlavha (Uz)</th>
                <th className="px-2 py-2">Sarlavha (Ru)</th>
                <th className="px-2 py-2">Sarlavha (En)</th>
                <th className="px-2 py-2">Sinov muddati</th>
                <th className="px-2 py-2 text-center">Boshqarish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 font-medium cursor-default"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                jobTypes.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-200 text-[12px] md:text-[14px]"
                  >
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2">{item.nameUz}</td>
                    <td className="px-2 py-2">{item.nameRu}</td>
                    <td className="px-2 py-2">{item.nameEn}</td>
                    <td className="px-2 py-2">
                      {item.isThereTrialPeriod ? "Ha" : "Yo‘q"}
                    </td>
                    <td className="px-2 py-2 flex gap-3 justify-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-blue-500 hover:text-blue-700 hover:drop-shadow-xl transition-colors duration-300 cursor-pointer"
                        title="Tahrirlash"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => askDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:drop-shadow-xl transition-colors duration-300 cursor-pointer"
                        title="O‘chirish"
                      >
                        <RiDeleteBin6Line size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loading={isSaving || isUpdating}
        isEdit={!!editingId}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutate(deleteId)}
        loading={isDeleting}
      />
    </div>
  );
};

export default JobTypesPage;
