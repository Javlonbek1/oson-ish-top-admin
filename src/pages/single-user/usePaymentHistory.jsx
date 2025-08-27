import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";

export const usePaymentHistory = ({ userId, page = 0, size = 10, status }) => {
  return useQuery({
    queryKey: ["paymentHistory", userId, page, size, status],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/users/${userId}/payment/history`,
        { params: { page, size, status } }
      );
      return data?.data;
    },
    enabled: !!userId,
    keepPreviousData: true,
  });
};
