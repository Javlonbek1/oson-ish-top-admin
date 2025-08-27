import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    setShowConfirm(false);
    navigate("/login");

    toast.success("Siz tizimdan chiqdingiz!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <header className="fixed z-[10] top-0 w-full flex justify-between items-center px-4 py-3 h-[70px] bg-white shadow">
        <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
        <button
          onClick={() => setShowConfirm(true)}
          className="group cursor-pointer flex items-center gap-3 px-2 py-2 rounded-xl transition-colors bg-blue-600 text-white shadow-lg"
        >
          Chiqish
        </button>
      </header>

      {/* Confirm Modal */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            className="bg-white rounded-lg p-6 w-[90%] max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              <AiOutlineClose size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Tizimdan chiqishni xohlaysizmi?
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded cursor-pointer"
              >
                Yo‘q
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <ToastContainer />
    </>
  );
}
