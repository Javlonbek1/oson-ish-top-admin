import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { TbLockOpen2 } from "react-icons/tb";
import { TbLockCheck } from "react-icons/tb";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { MdOutlineMailLock } from "react-icons/md";
import PaymentHistoryTable from "./PaymentHistoryTable";
import AnnouncementsPage from "../announcement-filters";
import { BsThreeDotsVertical } from "react-icons/bs";

// Get user data
const useUser = (id) =>
  useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/users/${id}`);
      return res.data?.data;
    },
  });

// Block/Unblock user (based on isEnabled)
const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, block }) => {
      const action = block ? "block" : "unblock";
      await axiosInstance.put(`/admin/users/${id}/${action}`);
      return block;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["user", variables.id]);
      toast.success(
        `Foydalanuvchi ${variables.block ? "Bloklandi" : "Blokdan ochildi"}!`
      );
    },
    onError: () => toast.error("Block/Unblock amalga oshmadi!"),
  });
};

// Freeze/Unfreeze user (based on balanceStatus)
const useFreezeUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, freeze }) => {
      const action = freeze ? "freeze" : "unfreeze";
      await axiosInstance.put(`/admin/users/${id}/balancee/${action}`);
      return freeze;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["user", variables.id]);
      toast.success(
        `Foydalanuvchi ${variables.freeze ? "muzlatildi" : "muzlatilishdan ochildi"}!`
      );
    },
    onError: () => toast.error("Muzlatish/Muzlatilmaslik amalga oshmadi!"),
  });
};

const UserPage = () => {
  const { usersId } = useParams();
  const { data: user, isLoading, isError, refetch } = useUser(usersId);

  const [block, setBlock] = useState(false);
  const [freeze, setFreeze] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [loadingFreeze, setLoadingFreeze] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const blockMutation = useBlockUser();
  const freezeMutation = useFreezeUser();

  useEffect(() => {
    if (user) {
      setBlock(!user.isEnabled);
      setFreeze(user.balanceStatus === "1");
    }
  }, [user?.id]);

  const handleBlockChange = () => {
    setLoadingBlock(true);
    blockMutation.mutate(
      { id: usersId, block: !block },
      {
        onSuccess: (_, variables) => setBlock(variables.block),
        onSettled: () => setLoadingBlock(false),
      }
    );
  };

  const handleFreezeChange = () => {
    setLoadingFreeze(true);
    freezeMutation.mutate(
      { id: usersId, freeze: !freeze },
      {
        onSuccess: (_, variables) => setFreeze(variables.freeze),
        onSettled: () => setLoadingFreeze(false),
      }
    );
  };

  const handleResumeDownload = () => {
    if (!user?.resumeResourcesId) return toast.error("Resume mavjud emas!");
    window.open(
      `https://api.osonishtop.uz/api/v1/file/download/${user.resumeResourcesId}`,
      "_blank"
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-red-600 font-bold mb-2">Xatolik yuz berdi!</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Qayta yuklash
        </button>
      </div>
    );

  return (
    <div className="relative">
      {/* 3 nuqta button */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
      >
        <BsThreeDotsVertical size={20} />
      </button>

      <div className="p-6 mb-2 bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row gap-6">
        {/* Avatar & Resume */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-between gap-4">
          {user.avatarResourcesId ? (
            <img
              src={`https://api.osonishtop.uz/api/v1/file/download/${user.avatarResourcesId}`}
              alt="avatar"
              className="w-48 h-48 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-semibold">
              Rasm qo‘yilmagan
            </div>
          )}

          {user.resumeResourcesId ? (
            <button
              onClick={handleResumeDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow transition"
            >
              <FiDownload /> Resume yuklab olish
            </button>
          ) : (
            <div className="text-gray-400 font-medium">Resume mavjud emas</div>
          )}
        </div>

        {/* User Info & Controls */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-800">{user.fio}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
            <div>
              <span className="font-medium">Phone:</span> {user?.phone}
            </div>
            <div>
              <span className="font-medium">Birth Date:</span>{" "}
              {user?.birthDate || "-"}
            </div>
            <div>
              <span className="font-medium">Balance:</span> {user?.balance}
            </div>
            <div>
              <span className="font-medium">Gender:</span>{" "}
              {user.gender}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={block}
                onChange={handleBlockChange}
                disabled={loadingBlock}
                className="hidden"
              />
              {block ? (
                <TbLockCheck className="text-red-400" size={25} />
              ) : (
                <TbLockOpen2 className="text-green-500" size={25} />
              )}
              <span className="font-medium text-[18px]">
                {loadingBlock
                  ? "Yuklanmoqda..."
                  : block
                    ? "Blocklangan"
                    : "Bloklanmagan"}
              </span>
            </label>

            <label className="flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={freeze}
                onChange={handleFreezeChange}
                disabled={loadingFreeze}
                className="hidden"
              />
              {freeze ? (
                <MdOutlineMailLock className="text-blue-400" size={25} />
              ) : (
                <MdOutlineMarkEmailRead className="text-green-500" size={25} />
              )}
              <span className="font-medium text-[18px]">
                {loadingFreeze
                  ? "Yuklanmoqda..."
                  : freeze
                    ? "Muzlatilgan"
                    : "Muzlatilmagan"}
              </span>
            </label>
          </div>
        </div>
      </div>

      <AnnouncementsPage />
      <PaymentHistoryTable userId={usersId} />

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-[400px] shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              Foydalanuvchi ma'lumotlari
            </h2>
            <div className="space-y-2 text-gray-700 text-sm">
              <p>
                <span className="font-medium">ID:</span> {user.id}
              </p>
              <p>
                <span className="font-medium">FIO:</span> {user.fio}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {user.phone}
              </p>
              <p>
                <span className="font-medium">Balance:</span> {user.balance}
              </p>
              <p>
                <span className="font-medium">Balance Statusi:</span> {user.balanceStatus}
              </p>
              <p>
                <span className="font-medium">BirthDate:</span> {user.birthDate ? user.birthDate : "-"}
              </p>
              <p>
                <span className="font-medium">avatarResourcesId:</span> {user.avatarResourcesId ? user.avatarResourcesId : "-"}
              </p>
              <p>
                <span className="font-medium">resumeResourcesId:</span> {user.resumeResourcesId ? user.resumeResourcesId : "-"}
              </p>
              <p>
                <span className="font-medium">Language:</span> {user.language}
              </p>
              <p>
                <span className="font-medium">Gender:</span>{" "}
                {user.gender ? "Erkak" : "Ayol"}
              </p>
              <p>
                <span className="font-medium">Created Date:</span>{" "}
                {user.createdDate || "-"}
              </p>
              <p>
                <span className="font-medium">Updated Date:</span>{" "}
                {user.updatedDate || "-"}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {user.isEnabled ? "Active" : "Inactive"}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
