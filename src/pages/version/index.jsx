import axiosInstance from "../../api/axiosInstance";
import VersionManagement from "./components/VersionManagement";

export default function VersionPage() {
    return <VersionManagement axiosInstance={axiosInstance}/>;
}