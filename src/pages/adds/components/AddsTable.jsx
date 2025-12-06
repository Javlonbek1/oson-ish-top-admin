import { useState } from "react";
import { FiEdit, FiEye, FiMoreVertical, FiX } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { baseURL } from "../../../api/path";
import { useNavigate } from "react-router-dom";

const AddsTable = ({
  items,
  page,
  size,
  isAdActive,
  handleDelete,
  handleEdit,
}) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null); // qaysi row ochilganini saqlash
  const [selectedAd, setSelectedAd] = useState(null); // ad detail modal
  const [selectedImage, setSelectedImage] = useState(null); // image modal uchun

  return (
    <div className="overflow-auto max-h-[550px] md:max-h-[60vh] relative">
      <table className="min-w-full table-auto text-sm whitespace-nowrap">
        <thead className="sticky top-0 bg-white z-10 border-b border-dashed border-gray-300">
          <tr className="text-gray-600 text-left text-sm">
            <th className="px-2 py-2">No</th>
            <th className="px-2 py-2">Rasm</th>
            <th className="px-2 py-2">Link</th>
            <th className="px-2 py-2">Holati</th>
            <th className="px-2 py-2">Muddati</th>
            <th className="px-2 py-2">Destination</th>
            <th className="px-2 py-2">Yaratilgan sana</th>
            <th className="px-2 py-2 text-center">Boshqarish</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-4 text-gray-500 font-medium"
              >
                Ma'lumot topilmadi
              </td>
            </tr>
          ) : (
            items.map((ad, idx) => {
              const imgUrl = `${baseURL}/file/download/${ad.resourcesId}`;
              return (
                <tr
                  key={ad.id}
                  className="hover:bg-gray-200 text-[12px] md:text-[14px] relative"
                  onClick={() => navigate(`/ads-stats/${ad.id}`)}
                >
                  <td className="px-2 py-2">{(page - 1) * size + idx + 1}</td>
                  <td className="px-2 py-2">
                    <img
                      src={imgUrl}
                      alt="media"
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedImage(imgUrl)}
                    />
                  </td>
                  <td className="px-2 py-2">{ad.link || "-"}</td>
                  <td
                    className={`px-2 py-2 font-semibold ${isAdActive(ad) ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {isAdActive(ad) ? "Active" : "Inactive"}
                  </td>
                  <td className="px-2 py-2">{ad.fixedDay || 0}</td>
                  <td className="px-2 py-2">{ad.destination ? "✅" : "❌"}</td>
                  <td className="px-2 py-2">
                    {new Date(ad.createdDate).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-2 flex gap-3 justify-center relative">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === ad.id ? null : ad.id)
                      }
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      <FiMoreVertical size={18} />
                    </button>

                    {/* Dropdown */}
                    {openDropdown === ad.id && (
                      <div className="absolute flex gap-[5px] overflow-hidden right-10 sm:right-26 sm:-mt-2 w-20 sm:w-24 bg-white border rounded-lg shadow-md z-50">
                        <button
                          onClick={() => {
                            setSelectedAd(ad);
                            setOpenDropdown(null);
                          }}
                          className="flex cursor-pointer items-center gap-2 px-2 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FiEye size={24} />
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(ad.id);
                            setOpenDropdown(null);
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
            })
          )}
        </tbody>
      </table>

      {/* Ad Detail Modal */}
      {selectedAd && (
        <div
          className="fixed inset-0 bg-black/20 px-[20px] flex items-center justify-center z-50"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Ad Details</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong> {selectedAd.id}
              </p>
              <p>
                <strong>Link:</strong> {selectedAd.link || "-"}
              </p>
              <p>
                <strong>Destination:</strong> {selectedAd.destination || "-"}
              </p>
              <p>
                <strong>Fixed Day:</strong> {selectedAd.fixedDay}
              </p>
              <p>
                <strong>View Count:</strong> {selectedAd.viewCnt}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(selectedAd.createdDate).toLocaleString()}
              </p>
              <p>
                <strong>Expired:</strong>{" "}
                {new Date(selectedAd.expiredDate).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedAd(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Selected"
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow hover:bg-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddsTable;
