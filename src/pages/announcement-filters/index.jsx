import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"; // 🔥 qo‘shildi
import { FaWifi, FaSync, FaUsers } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import PaginationAnn from "./components/PaginationAnn";
import RejectModal from "./components/RejectModal";
import { TbPhonePlus } from "react-icons/tb";
import AnnounceCard from "./components/AnnounceCard";

const statusTabs = [
  "ALL",
  "WAITING",
  "DRAFT",
  "ACCEPTED",
  "REJECTED",
  "ARCHIVE",
  "DELETED",
];

// ✅ filter hook
const useAnnouncements = ({
  status,
  page = 0,
  size = 10,
  annTypeId,
  salaryFrom,
  salaryTo,
  searchText,
  ownerId, // 🔥 qo‘shildi
}) =>
  useQuery({
    queryKey: [
      "announcements",
      status,
      page,
      size,
      annTypeId,
      salaryFrom,
      salaryTo,
      searchText,
      ownerId, // 🔥 queryKey ga qo‘shildi
    ],
    queryFn: async () => {
      const params = { page: page + 1, size };

      if (status !== "ALL") params.annStatus = status;
      if (annTypeId) params.annTypeId = annTypeId;
      if (salaryFrom) params.salaryFrom = Number(salaryFrom);
      if (salaryTo) params.salaryTo = Number(salaryTo);
      if (searchText) params.searchText = searchText;

      const res = await axiosInstance.get("/admin/ann/filter", { params });

      let responseData = res.data.data;

      // 🔥 ownerId bo‘lsa, client tarafida filter qilamiz
      if (ownerId) {
        responseData = {
          ...responseData,
          content: responseData.content.filter(
            (el) => String(el.ownerId) === String(ownerId)
          ),
          totalElements: responseData.content.filter(
            (el) => String(el.ownerId) === String(ownerId)
          ).length,
          totalPages: 1, // filter qilinganda pagination qaytadan hisoblanadi
        };
      }

      return responseData;
    },

    keepPreviousData: true,
  });

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { usersId: ownerId } = useParams(); // 🔥 URL dan id olamiz (agar bo‘lsa)
console.log(ownerId);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState("ALL");
  const [rejectModal, setRejectModal] = useState({ open: false, annId: null });
  const [reason, setReason] = useState("");

  // ✅ filters
  const [annTypeId, setAnnTypeId] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [searchText, setSearchText] = useState("");

  // Draft state (inputlarga yozish uchun)
  const [searchTextDraft, setSearchTextDraft] = useState("");
  const [salaryFromDraft, setSalaryFromDraft] = useState("");
  const [salaryToDraft, setSalaryToDraft] = useState("");
  const [annTypeDraft, setAnnTypeDraft] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);

  // 🔥 Filterlarni qo‘llash tugmasi
  const applyFilters = () => {
    setSearchText(searchTextDraft);
    setSalaryFrom(salaryFromDraft);
    setSalaryTo(salaryToDraft);
    setAnnTypeId(annTypeDraft);
    setPage(0);
  };

  // ✅ AnnType-larni olish
  const { data: annTypes } = useQuery({
    queryKey: ["ann-types"],
    queryFn: async () => {
      const res = await axiosInstance.get("/ann-types/read");
      return res.data.data;
    },
  });

  const { data, isLoading, isError, refetch } = useAnnouncements({
    status,
    page,
    size,
    annTypeId,
    salaryFrom,
    salaryTo,
    searchText,
    ownerId, // 🔥 filterga yuboramiz
  });

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
          <FaSync className="animate-spin-slow" /> Qayta urinib ko‘rish
        </button>
      </div>
    );

  const totalPages = data?.totalPages || 1;

  // ✅ Cardlarni createdDate bo‘yicha tartiblash (eng yangisi eng oldinda)
  const sortedContent = data?.content
    ? [...data.content].sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      )
    : [];

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Tabs + Filter button */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 min-w-max">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-4 py-2 cursor-pointer rounded-t-lg outline-none font-medium transition whitespace-nowrap ${
                status === tab
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}

          {/* Filterlash Button */}
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`px-4 py-2 border-none cursor-pointer rounded-t-lg font-medium transition whitespace-nowrap ${
              filtersOpen
                ? "bg-green-500 text-white shadow"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            FILTER
          </button>
        </div>
      </div>

      {/* ✅ Filters */}
      <div
        className={`flex flex-wrap items-center gap-3 mb-4 pb-1 transition-all duration-500 overflow-hidden ${
          filtersOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <input
          type="text"
          placeholder="Qidirish (fio/telefon)..."
          value={searchTextDraft}
          onChange={(e) => setSearchTextDraft(e.target.value)}
          className="rounded px-3 py-2 w-full sm:w-64 border bg-white border-gray-200 outline-none"
        />

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min salary"
            value={salaryFromDraft}
            onChange={(e) => setSalaryFromDraft(e.target.value)}
            className="rounded px-3 py-2 w-full sm:w-32 border bg-white border-gray-200 outline-none"
          />
          <input
            type="number"
            placeholder="Max salary"
            value={salaryToDraft}
            onChange={(e) => setSalaryToDraft(e.target.value)}
            className="rounded px-3 py-2 w-full sm:w-32 border bg-white border-gray-200 outline-none"
          />
        </div>

        {/* ✅ AnnType Select */}
        <select
          value={annTypeDraft}
          onChange={(e) => setAnnTypeDraft(e.target.value)}
          className="rounded px-3 py-2 border bg-white border-gray-200 outline-none"
        >
          <option value="">Barcha turlari</option>
          {annTypes?.map((type) => (
            <option key={type.id} value={type.id}>
              {type.nameUz}
            </option>
          ))}
        </select>

        {/* Apply filter tugmasi */}
        <button
          onClick={applyFilters}
          className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          Apply Filter
        </button>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedContent.length === 0 ? (
          <p className="col-span-full text-center py-8 text-gray-500">
            Ma’lumot topilmadi
          </p>
        ) : (
          sortedContent.map((ann, i) => (
            <AnnounceCard navigate={navigate} ann={ann} key={i} />
          ))
        )}
      </div>

      <PaginationAnn totalPages={totalPages} page={page} setPage={setPage} />
      <RejectModal
        rejectModal={rejectModal}
        setReason={setReason}
        setRejectModal={setRejectModal}
      />
    </div>
  );
};

export default AnnouncementsPage;
