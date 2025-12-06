import axiosInstance from "../../api/axiosInstance";
// import AdsStats from "./components/AdsStats";
import AdsStatsClick from "./components/AdsStatsClick";

export default function DashboardPage() {
    return <AdsStatsClick axiosInstance={axiosInstance} />;
}