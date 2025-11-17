import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaSync, FaWifi } from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AnnounceCard from "./components/AnnounceCard";
import PaginationAnn from "./components/PaginationAnn";
import RejectModal from "./components/RejectModal";

const statusTabs = [
  "ALL",
  "WAITING",
  "DRAFT",
  "ACCEPTED",
  "REJECTED",
  "ARCHIVE",
  "DELETED",
];

// Helper: localStorage’dan filterlarni olish
const getFiltersFromStorage = () => ({
  status: localStorage.getItem("ann_status") || "ALL",
  searchText: localStorage.getItem("ann_searchText") || "",
  salaryFrom: localStorage.getItem("ann_salaryFrom") || "",
  salaryTo: localStorage.getItem("ann_salaryTo") || "",
  annTypeId: localStorage.getItem("ann_annTypeId") || "",
});

// Announcements hook
const useAnnouncements = ({
  status,
  page = 0,
  size = 10,
  annTypeId,
  salaryFrom,
  salaryTo,
  searchText,
  ownerId,
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
      ownerId,
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

      if (ownerId) {
        const filtered = responseData.content.filter(
          (el) => String(el.ownerId) === String(ownerId)
        );
        responseData = {
          ...responseData,
          content: filtered,
          totalElements: filtered.length,
          totalPages: 1,
        };
      }

      return responseData;
    },
    keepPreviousData: true,
  });

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const { usersId: ownerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [page, setPage] = useState(0);

  const storedFilters = getFiltersFromStorage();

  const [status, setStatus] = useState(storedFilters.status);
  const [searchText, setSearchText] = useState(storedFilters.searchText);
  const [salaryFrom, setSalaryFrom] = useState(storedFilters.salaryFrom);
  const [salaryTo, setSalaryTo] = useState(storedFilters.salaryTo);
  const [annTypeId, setAnnTypeId] = useState(storedFilters.annTypeId);

  // Draft state (inputlarda yozish uchun)
  const [searchTextDraft, setSearchTextDraft] = useState(searchText);
  const [salaryFromDraft, setSalaryFromDraft] = useState(salaryFrom);
  const [salaryToDraft, setSalaryToDraft] = useState(salaryTo);
  const [annTypeDraft, setAnnTypeDraft] = useState(annTypeId);




  const [filtersOpen, setFiltersOpen] = useState(false);

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, annId: null });
  const [reason, setReason] = useState("");

  // localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem("ann_status", status);
    localStorage.setItem("ann_searchText", searchText);
    localStorage.setItem("ann_salaryFrom", salaryFrom);
    localStorage.setItem("ann_salaryTo", salaryTo);
    localStorage.setItem("ann_annTypeId", annTypeId);
  }, [status, searchText, salaryFrom, salaryTo, annTypeId]);

  // URL → state sync (faqat status uchun)
  useEffect(() => {
    const statusQP = searchParams.get("status");
    if (statusQP && statusQP !== status) {
      setStatus(statusQP);
    }
    // page endi URL bilan bog‘lanmaydi!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // FILTER/STATUS/OWNER O‘ZGARGANDA page=0
  useEffect(() => {
    setPage(0);
  }, [status, searchText, salaryFrom, salaryTo, annTypeId, ownerId]);

  const applyFilters = () => {
    setSearchText(searchTextDraft);
    setSalaryFrom(salaryFromDraft);
    setSalaryTo(salaryToDraft);
    setAnnTypeId(annTypeDraft);
    // page reset yuqoridagi effect orqali avtomatik bo‘ladi
  };

  // AnnType-larni olish
  const { data: annTypes } = useQuery({
    queryKey: ["ann-types"],
    queryFn: async () => (await axiosInstance.get("/ann-types/read")).data.data,
  });

  // Announcements query
  const { data, isLoading, isError, refetch } = useAnnouncements({
    status,
    page,
    size: 10,
    annTypeId,
    salaryFrom,
    salaryTo,
    searchText,
    ownerId,
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
  const sortedContent = data?.content
    ? [...data.content].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    )
    : [];

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Tabs + Filter button */}
      <div className="overflow-x-auto mb-4">
        <div className="flex items-center gap-3 border-b border-gray-200 min-w-max">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatus(tab);
                setPage(0); // reset state
                setSearchParams((prev) => {
                  const sp = new URLSearchParams(prev);
                  sp.set("status", tab); // faqat status URL’da saqlanadi
                  return sp;
                });
              }}
              className={`px-4 py-2 cursor-pointer rounded-t-lg font-medium transition whitespace-nowrap ${status === tab
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 hover:text-blue-500"
                }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`px-4 py-2 border-none cursor-pointer rounded-t-lg font-medium transition whitespace-nowrap ${filtersOpen
              ? "bg-green-500 text-white shadow"
              : "text-gray-600 hover:text-green-500"
              }`}
          >
            FILTER
          </button>
        </div>

      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Qidirish (fio/telefon)..."
            value={searchTextDraft}
            onChange={(e) => setSearchTextDraft(e.target.value)}
            className="rounded px-3 py-2 w-full sm:w-64 border bg-white border-gray-200 outline-none"
          />
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
          <button
            onClick={applyFilters}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Apply Filter
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedContent.length === 0 ? (
          <p className="col-span-full text-center py-8 text-gray-500">
            Ma’lumot topilmadi
          </p>
        ) : (
          sortedContent.map((ann, i) => (
            <AnnounceCard
              key={i}
              ann={ann}
              navigate={navigate}
              currentStatus={status}
            />
          ))
        )}
      </div>

      <PaginationAnn
        totalPages={totalPages}
        page={page}
        setPage={(p) => {
          setPage(p); // faqat state
        }}
      />

      <RejectModal
        rejectModal={rejectModal}
        setReason={setReason}
        setRejectModal={setRejectModal}
      />



    </div>
  );
};

export default AnnouncementsPage;

