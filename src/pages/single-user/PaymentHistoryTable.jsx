import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { FaWifi, FaSync } from "react-icons/fa";

const usePaymentHistory = (userId, page = 1, size = 5, status) =>
  useQuery({
    queryKey: ["paymentHistory", userId, page, size, status],
    queryFn: async () => {
      let url = `/admin/users/${userId}/payment/history?page=${page}&size=${size}`;
      if (status) url += `&status=${status}`;
      const res = await axiosInstance.get(url);
      return res.data.data;
    },
    enabled: !!userId,
    keepPreviousData: true,
  });

const PaymentHistoryTable = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const size = 5;

  const { data, isLoading, isError, refetch } = usePaymentHistory(
    userId,
    page,
    size,
    status
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center my-4">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center my-4 text-center">
        <FaWifi size={36} className="text-red-400 mb-2" />
        <p className="text-red-600 mb-2">Payment history yuklanmadi!</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          <FaSync className="inline mr-2" />
          Qayta yuklash
        </button>
      </div>
    );

  const totalPages = data?.totalPages || 0;

  return (
    <div className="mt-6 bg-white p-4 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm sm:text-lg font-semibold ">To'lov tarixi</h2>

        <div className="">
          <label className="text-sm sm:text-lg mr-2 font-medium">Statuslar:</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1); // filter o‘zgarganda sahifani 1 ga reset qilamiz
            }}
            className="border border-gray-300 rounded-lg px-3 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Hammasi</option>
            <option value="INPUT">Kiritilgan</option>
            <option value="OUTPUT">Ishlatilgan</option>
          </select>
        </div>
      </div>

      {/* Table yoki xabar */}
      {data?.content && data.content.length > 0 ? (
        <div className="overflow-auto ">
          <table className="min-w-full  text-sm table-auto whitespace-nowrap">
            <thead className="bg-gray-100  top-0">
              <tr className="text-left text-gray-600">
                <th className="px-2 py-2">No</th>
                <th className="px-2 py-2">Sanasi</th>
                <th className="px-2 py-2">To'lov Uslubi</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Narxi</th>
                <th className="px-2 py-2">Sababi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-200">
                  <td className="px-2 py-1">{(page - 1) * size + idx + 1}</td>
                  <td className="px-2 py-1">
                    {new Date(p.date).toLocaleString()}
                  </td>
                  <td className="px-2 py-1">{p.source}</td>
                  <td className="px-2 py-1">
                    {p.status === "INPUT"
                      ? "Kiruvchi"
                      : p.status === "OUTPUT"
                        ? "Chiquvchi"
                        : p.status}
                  </td>
                  <td className="px-2 py-1">{p.price}</td>
                  <td className="px-2 py-1">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">Payment history mavjud emas</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4 items-center">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border disabled:opacity-50 cursor-pointer"
          >
            <GrFormPreviousLink />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50 cursor-pointer"
          >
            <GrFormNextLink />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryTable;
