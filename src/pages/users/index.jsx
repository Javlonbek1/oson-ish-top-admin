import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaWifi, FaSync } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { AiOutlineFile } from "react-icons/ai";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { BsThreeDots } from "react-icons/bs";

const useUsers = (page = 1, size = 10, search = "") =>
  useQuery({
    queryKey: ["users", page, size, search],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/users?page=${page}&size=${size}&search=${search}`
      );
      return res.data.data;
    },
    keepPreviousData: true,
  });

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => axiosInstance.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Foydalanuvchi muvaffaqiyatli o‘chirildi!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "O‘chirishda xatolik!");
    },
  });
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0); // API page 0-based
  const [size] = useState(10);

  // 🔑 yangi qo‘shildi
  const [searchInput, setSearchInput] = useState(""); // input uchun
  const [search, setSearch] = useState(""); // API uchun

  const [selectedUser, setSelectedUser] = useState(null); // modal uchun

  const { data, isLoading, isError, refetch } = useUsers(page + 1, size, search); // API 1-based
  const { mutate: deleteUser } = useDeleteUser();

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (isError)
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

  const handleResumeDownload = (resumeId) => {
    if (!resumeId) return toast.error("Resume mavjud emas!");
    window.open(
      `${axiosInstance.defaults.baseURL}/resources/${resumeId}/download`,
      "_blank"
    );
  };

  const handleSearch = () => {
    setPage(0);
    setSearch(searchInput.trim()); // faqat tugma bosilganda yoki Enter bosilganda API chaqiladi
  };

  const totalPages = data.totalPages;

  return (
    <div className="bg-white overflow-hidden rounded-xl p-4">
      <div className="flex justify-between gap-[10px] items-center mb-4">
        {/* Search */}
        <div className="flex w-full sm:w-auto">
          <input
            type="search"
            placeholder="Foydalanuvchi qidirish..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="border border-gray-300 px-3 py-2 rounded-l-lg w-full sm:max-w-64 md:w-72 focus:outline-none transition"
          />
          <button
            type="button"
            className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded-r-lg hover:bg-blue-600 transition transform shadow-md"
            onClick={handleSearch}
          >
            <IoSearch size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[550px] md:max-h-[60vh]">
        <table className="min-w-full table-auto text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10 font-nunito border-b border-dashed border-gray-300">
            <tr className="text-gray-600 text-left text-sm">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Avatar</th>
              <th className="px-2 py-2">FIO</th>
              <th className="px-2 py-2">Telfon raqami</th>
              <th className="px-2 py-2">Birth Date</th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">...</th>
              <th className="px-2 py-2">Resume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              data.content
                .filter(
                  (el) =>
                    ![
                      "5698b957-3890-4e98-a829-515b5cf5920e",
                      "ffbe5702-3f6a-4128-bae0-d67a7e68371b",
                      "cf88898b-dba7-48ee-83e2-fb9b00c2ded1",
                    ].includes(el.id)
                )
                .map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-200 text-[12px] md:text-[14px] cursor-pointer"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="px-2 py-1">{page * size + idx + 1}</td>
                    <td className="px-2 py-1">
                      {user.avatarResourcesId ? (
                        <img
                          src={`https://api.osonishtop.uz/api/v1/file/download/${user.avatarResourcesId}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <img className="w-10 h-10 p-2" src="/user.svg" alt="" />
                      )}
                    </td>
                    <td className="px-2 py-2">{user.fio}</td>
                    <td className="px-2 py-2">{user.phone}</td>
                    <td className="px-2 py-2">{user.birthDate || "-"}</td>
                    <td className="px-2 py-2">{user.balance}</td>
                    <td className="px-2 py-2">
                      {user.isEnabled ? (
                        <span className="text-green-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                        className="text-gray-600 cursor-pointer rotate-90 hover:text-black"
                      >
                        <BsThreeDots size={20} />
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      {user.resumeResourcesId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResumeDownload(user.resumeResourcesId);
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          Yuklab olish
                        </button>
                      ) : (
                        <AiOutlineFile className="text-gray-400" title="Resume mavjud emas" />
                      )}
                    </td>
                  </tr>
                ))
              
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4 items-center">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 rounded disabled:opacity-50 border cursor-pointer"
          >
            <GrFormPreviousLink />
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 rounded disabled:opacity-50 border cursor-pointer"
          >
            <GrFormNextLink />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-96 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Foydalanuvchi ma'lumotlari
            </h2>
            <p>
              <b>FIO:</b> {selectedUser.fio}
            </p>
            <p>
              <b>Telefon:</b> {selectedUser.phone || "-"}
            </p>
            <p>
              <b>Balans:</b> {selectedUser.balance}
            </p>
            <p>
              <b>Tug‘ilgan sana:</b> {selectedUser.birthDate || "-"}
            </p>
            <p>
              <b>Holati:</b> {selectedUser.isEnabled ? "Active" : "Inactive"}
            </p>
            <p>
              <b>Til:</b> {selectedUser.language}
            </p>
            <p>
              <b>Yaratilgan:</b> {selectedUser.createdDate}
            </p>
            <p>
              <b>Yangilangan:</b> {selectedUser.updatedDate}
            </p>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
