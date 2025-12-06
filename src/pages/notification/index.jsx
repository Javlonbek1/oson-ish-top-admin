import axiosInstance from "../../api/axiosInstance";
import NotificationForm from "./componnents/NotificationManager";

export default function DashboardPage() {
    return <NotificationForm axiosInstance={axiosInstance} endpoint="/admin/users/stats" />;
}