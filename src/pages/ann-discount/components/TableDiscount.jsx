import React, { useState, useEffect, useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiEye } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

const typeColors = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-green-100 text-green-800",
  3: "bg-yellow-100 text-yellow-800",
  default: "bg-gray-100 text-gray-800",
};

const AnnouncementDiscountTable = ({
  discounts,
  annTypes,
  page,
  size,
  loadingId,
  onEdit,
  onDelete,
}) => {
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  // tashqi bosilganda kichik modalni yopish
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="overflow-auto max-h-[550px] relative">
      <table className="min-w-full table-auto text-sm border-separate border-spacing-y-1">
        <thead className="bg-white">
          <tr className="bg-gray-100">
            <th className="p-3 text-left whitespace-nowrap">No</th>
            <th className="p-3 text-left whitespace-nowrap">Turi</th>
            <th className="p-3 text-left whitespace-nowrap">Kuni</th>
            <th className="p-3 text-left whitespace-nowrap">Chegirma (%)</th>
            <th className="p-3 text-left whitespace-nowrap">Boshqarish</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((item, idx) => {
            const type = annTypes.find((t) => t.id === item.annTypesId);
            const colorClass =
              typeColors[item.annTypesId] || typeColors.default;

            return (
              <tr
                key={item.id}
                className="hover:bg-gray-50 rounded-lg relative"
              >
                <td className="p-3">{idx + 1 + (page - 1) * size}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded ${colorClass}`}>
                    {type?.nameUz || "Noma'lum"}
                  </span>
                </td>
                <td className="p-3">{item.fixedDay} kun</td>
                <td className="p-3">
                  {loadingId === item.id ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    `${item.discount}%`
                  )}
                </td>
                <td className="p-3 flex gap-1 relative">
                  <button
                    onClick={() => {
                      onEdit(item);
                      setDropdownOpenId(null);
                    }}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 hover:bg-gray-100  text-left"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-200"
                  >
                    <BsThreeDotsVertical size={18} />
                  </button>

                  {dropdownOpenId === item.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute flex gap-[5px] border-none overflow-hidden right-22 sm:right-76 sm:-mt-2 w-20 sm:w-24 bg-white border rounded-lg shadow-md z-50"
                    >
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setDropdownOpenId(null);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full text-left"
                      >
                        <FiEye size={24} />
                      </button>
                      <button
                        onClick={() => {
                          onDelete(item.id);
                          setDropdownOpenId(null);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full text-left"
                      >
                        <RiDeleteBin6Line size={24} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal - To‘liq ko‘rish */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-black/20 px-[20px] flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg p-6 w-96"
          >
            <h2 className="text-xl font-semibold mb-4">
              Chegirma ma’lumotlari
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">ID:</span> {selectedItem.id}
              </p>
              <p>
                <span className="font-semibold">Turi ID:</span>{" "}
                {selectedItem.annTypesId}
              </p>
              <p>
                <span className="font-semibold">Yaratilgan sana:</span>{" "}
                {new Date(selectedItem.createdDate).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Kuni:</span>{" "}
                {selectedItem.fixedDay} kun
              </p>
              <p>
                <span className="font-semibold">Chegirma:</span>{" "}
                {selectedItem.discount}%
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementDiscountTable;
