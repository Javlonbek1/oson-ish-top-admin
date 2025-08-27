import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    navigate("/login");
  };

  return (
    <header className="fixed z-[10] top-0 w-full flex justify-between items-center px-4 py-3 h-[70px] bg-white shadow">
      <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
      <button
        onClick={handleLogout}
        className={
          `group cursor-pointer flex items-center gap-3 px-2 py-2 rounded-xl transition-colors 
              bg-blue-600 text-white shadow-lg
          `
        }
      >
        Chiqish
      </button>
    </header>
  );
}
