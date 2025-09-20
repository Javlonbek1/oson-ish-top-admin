import DashboardMetrics from "./components/DashboardMetrics";
import axiosInstance from "../../api/axiosInstance";

export default function DashboardPage() {
    return <DashboardMetrics axiosInstance={axiosInstance} endpoint="/admin/users/stats" />;
}