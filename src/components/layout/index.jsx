import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { IoCode } from "react-icons/io5";
import Header from "../header";
import Aside from "../aside";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const toggleAside = () => {
    setOpen(!open);
    localStorage("open" , open)
  };

    const navigate = useNavigate();

    useEffect(() => {
      const lastPath = localStorage.getItem("lastPath") || "/region";
      navigate(lastPath, { replace: true });
    }, [navigate]);

  return (
    <>
      <Header />
      <main className="flex res bg-gray-100">
        {" "}
        {/* Header balandligi ayirildi */}
        {/* Aside */}
        <div
          className={`fixed z-[10] top-[70px] sm:relative bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
            open ? "w-[64px]" : "w-[240px]"
          }`}
        >
          {/* Toggle button */}
          <button
            onClick={toggleAside}
            className={`absolute z-[201] outline-none cursor-pointer -top-3 -right-3 z-10 p-1 border-2 border-gray-300 bg-white hover:bg-blue-100 rounded-md transition-all duration-300`}
          >
            <IoCode className="text-xl text-blue-500" />
          </button>

          <Aside open={open} />
        </div>
        {/* Main content */}
        <div className="flex-1 pl-[78px] res mt-[72px]  sm:pl-3 bg-gray-100 overflow-auto p-3 md:p-5">
          <Outlet />
        </div>
      </main>
    </>
  );
}
