import React ,  {useState} from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { MdWorkHistory } from "react-icons/md";
import { TbPhonePlus } from "react-icons/tb";

const AnnounceCard = ({ ann, navigate }) => {
  const [selectedFilter, setSelectedFilter] = useState(null); // modal uchun

  return (
    <>
    <div
      key={ann.id}
      className={`bg-white overflow-hidden relative z-[0] border border-gray-300 rounded-xl shadow-md p-4 flex flex-col gap-3 transition duration-[0.5s] w-full ${
        ann.annStatus === "WAITING"
          ? "hover:shadow-yellow-300"
          : ann.annStatus === "ACCEPTED"
            ? "hover:shadow-green-300"
            : ann.annStatus === "REJECTED"
              ? "hover:shadow-red-300"
              : "hover:shadow-gray-300"
      }`}
    >
      <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFilter(ann);
          }}
          className="text-gray-600 absolute top-[10px] right-[5px] cursor-pointer rotate-90 hover:text-black"
        >
          <BsThreeDots size={20} />
        </button>
      {/* Status */}
      <div className="grid grid-cols-2 gap-x-[20px]">
        <span
          className={`flex items-center gap-2 text-sm font-medium ${
            ann.annStatus === "WAITING"
              ? "text-yellow-600"
              : ann.annStatus === "ACCEPTED"
                ? "text-green-600"
                : ann.annStatus === "REJECTED"
                  ? "text-red-600"
                  : "text-gray-600"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          {ann.annStatus}
        </span>

        <span className="italic">{ann.ownerFio}</span>
        <span className="font-medium">{ann.company}</span>

        <span className="text-indigo-600 flex items-center gap-1 font-medium cursor-pointer hover:underline">
          <TbPhonePlus />
          <a href={`tel: ${ann.ownerPhone?.toString().split(".")[0]}`}>
            {ann.ownerPhone?.toString().split(".")[0]}
          </a>
        </span>

        <div className="flex items-center justify-between">
          {ann.salaryFrom && ann.salaryTo ? (
            <span className="font-semibold text-gray-800">
              {ann.salaryFrom} {ann.annSalaryCurrency} - {ann.salaryTo} {ann.annSalaryCurrency}
            </span>
          ) : (
            <span className="text-gray-400 italic">Belgilanmagan</span>
          )}
        </div>

        <div>
          {ann.contacts.split(",")?.map((contact, i) => (
            <span
              key={i}
              className="text-indigo-600 flex items-center gap-1 font-medium cursor-pointer hover:underline"
            >
              <MdWorkHistory />
              <a href={`tel: ${contact}`}>{contact}</a>
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-gray-500" />
            {ann.peopleCnt}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-md ${
                ann.annTypeName === "Premium"
                  ? " text-yellow-600"
                  : ann.annTypeName === "Comford"
                    ? " text-green-600"
                    : ann.annTypeName === "Standart"
                      ? " text-blue-600"
                      : " text-gray-600"
              }`}
            >
              {ann.annTypeName}
            </span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center border-none outline-none justify-between border-t border-t-gray-300 pt-4">
        <span className="bottom-0 p-1 py-[8.2px] flex items-center h-[45px] sm:p-2 left-0 w-[60%] sm:w-[55%] sm:font-bold text-[13px] sm:text-[14px] absolute bg-orange-300">
          {new Date(ann.createdDate).toLocaleString().split(",")[0]} <br />
          {new Date(ann.createdDate).toLocaleString().split(",")[1]}
        </span>
        <button
          onClick={() =>
            navigate(`/ann-filters/${ann.ownerId}|${ann.id}|${ann.ownerPhone}`)
          }
          className="absolute border-none outline-none justify-center h-[45px] right-0 w-[40%] sm:w-[45%] transition-colors duration-[0.5s] bottom-0 p-[6.2px] bg-blue-200 cursor-pointer hover:text-indigo-600 text-[16px] font-bold flex items-center gap-1"
        >
          Batafsil
        </button>
      </div>
    </div>
  {/* Modal */}
  {selectedFilter && (
  <div
    className="fixed inset-0 bg-black/20 flex z-[201] items-center justify-center z-50"
    onClick={() => setSelectedFilter(null)}
  >
    <div
      className="bg-white rounded-xl shadow-lg w-[95%] max-w-lg p-6 overflow-y-auto max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4">E'lon ma'lumotlari</h2>

      <p><b>ID:</b> {selectedFilter.id}</p>
      <p><b>Yaratilgan:</b> {selectedFilter.createdDate}</p>
      <p><b>Yangilangan:</b> {selectedFilter.updatedDate}</p>
      <p><b>Tugash sanasi:</b> {selectedFilter.expiredDate || "-"}</p>
      <p><b>Egasining ID:</b> {selectedFilter.ownerId}</p>

      <button
        onClick={() => setSelectedFilter(null)}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Yopish
      </button>
    </div>
  </div>
)}
    </>
  );
};

export default AnnounceCard;
