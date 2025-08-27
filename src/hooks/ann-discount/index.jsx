import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";

const useAnnDiscounts = (page = 1, limit = 10, annTypesId = 0) =>
  useQuery({
    queryKey: ["ann-discounts", page, limit, annTypesId],
    queryFn: async () => {
      const res = await axiosInstance.get("/ann-discounts/read", {
        params: { page, limit, annTypesId },
      });
      return {
        data: res.data.data || [],
        pagination: res.data.pagination || { page, limit, total: 0 },
      };
    },
    keepPreviousData: true,
  });

export default useAnnDiscounts;
