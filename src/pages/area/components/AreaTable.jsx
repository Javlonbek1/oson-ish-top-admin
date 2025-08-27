import React, { useState, useRef, useEffect } from "react";
import { FiEdit, FiEye } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";

const AreaTable = ({
  areas,
  regions,
  handleEdit,
  setDeleteConfirm,
  edit,
  delate,
}) => {
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  // tashqariga bosilganda kichik modal yopilsin
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
    <div className="overflow-auto max-h-[550px] md:max-h-[70vh]">
      <table className="min-w-full table-auto text-sm whitespace-nowrap">
        <thead className=" top-0 bg-white z-10 font-nunito border-b border-dashed border-gray-300">
          <tr>
            <th
              colSpan="6"
              className="text-right px-4 pt-2 font-normal text-sm text-gray-800 underline"
            >
              Tumanlar soni: ({areas?.length})
            </th>
          </tr>
          <tr className="text-gray-600 text-left text-sm">
            <th className="px-2 py-2">No</th>
            <th className="px-2 py-2">Tuman nomi (UZ)</th>
            <th className="px-2 py-2">Tuman nomi (EN)</th>
            <th className="px-2 py-2">Tuman nomi (RU)</th>
            <th className="px-2 py-2">Viloyat nomi</th>
            <th className="px-2 py-2">Boshqarish</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {areas.length > 0 ? (
            areas.map((area, idx) => (
              <tr
                key={area.id || area.nameUz}
                className="hover:bg-gray-200 text-[12px] md:text-[14px] cursor-pointer"
              >
                <td className="px-2 py-2">{idx + 1}</td>
                <td className="px-2 py-2">{area.nameUz}</td>
                <td className="px-2 py-2">{area.nameEn}</td>
                <td className="px-2 py-2">{area.nameRu}</td>
                <td className="px-2 py-2">
                  {regions.find((reg) => reg.id === area.regionsId)?.nameUz ||
                    "Noma'lum"}
                </td>
                <td
                  className="px-2 py-2 flex gap-3 justify-center relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(area)}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                  >
                    <FiEdit size={18} />
                  </button>

                  {/* 3 nuqta */}
                  <button
                    onClick={() => toggleDropdown(area.id)}
                    className="p-1 cursor-pointer rounded-full hover:bg-gray-200"
                  >
                    <BsThreeDotsVertical size={18} />
                  </button>

                  {/* Kichik modal */}
                  {dropdownOpenId === area.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute flex gap-[5px] border-none overflow-hidden right-10 sm:right-36 sm:-mt-2 w-20 sm:w-24 bg-white border rounded-lg shadow-md z-50"
                    >
                      <button
                        onClick={() => {
                          setSelectedItem(area);
                          setDropdownOpenId(null);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full text-left"
                      >
                        <FiEye size={24} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm(area.id);
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
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center py-4 text-gray-500 font-medium cursor-default"
              >
                Ma'lumot topilmadi
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Katta modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-black/20  flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg p-6 w-96"
          >
            <h2 className="text-xl font-semibold mb-4">Tuman ma’lumotlari</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">ID:</span> {selectedItem.id}
              </p>
              <p>
                <span className="font-semibold">Nomi:</span> {selectedItem.name}
              </p>
              <p>
                <span className="font-semibold">Tuman (Uz):</span>{" "}
                {selectedItem.nameUz}
              </p>
              <p>
                <span className="font-semibold">Tuman (En):</span>{" "}
                {selectedItem.nameEn}
              </p>
              <p>
                <span className="font-semibold">Tuman (Ru):</span>{" "}
                {selectedItem.nameRu}
              </p>
              <p>
                <span className="font-semibold">Viloyat ID:</span>{" "}
                {selectedItem.regionsId}
              </p>
              <p>
                <span className="font-semibold">Viloyat nomi:</span>
                {regions.find((reg) => reg.id === selectedItem.regionsId)
                  ?.nameUz || "Noma'lum"}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 cursor-pointer py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

export default AreaTable;
