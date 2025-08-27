import { FaCalendarAlt, FaCalendarCheck } from "react-icons/fa";

export default function VacancyDates({ vacancy }) {
  const updated = new Date(vacancy.updatedDate);
  const expired = new Date(vacancy.expiredDate);
  const today = new Date();

  const totalDays = Math.ceil((expired - updated) / (1000 * 60 * 60 * 24));
  const passedDays = Math.max(
    0,
    Math.ceil((today - updated) / (1000 * 60 * 60 * 24))
  );
  const remainingDays = totalDays - passedDays;

  const progress = Math.min((passedDays / totalDays) * 100, 100);

  const isExpired = remainingDays <= 0;

  return (
    <div className="bg-white shadow-sm rounded-xl w-full p-2 flex flex-col gap-5">
        {/* Info */}
        <div className="flex justify-between text-sm text-gray-600 mt-3">
          <p>
            ⏳{" "}
            {passedDays > 0 ? `${passedDays} kun o'tdi` : "yaqinda qo'yilgan"}
          </p>
          <p>
            🕒{" "}
            {remainingDays > 0
              ? `${remainingDays} kun qoldi`
              : "Muddat tugagan"}
          </p>
        </div>

      {/* Timeline */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Start Date */}
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-medium">
            {updated.toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">Qo'yilgan</span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full sm:w-2/3">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isExpired ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Numbers */}
          <div className="relative mt-2 text-xs text-gray-600">
            {/* 0 left */}
            <span className="absolute left-0">0</span>

            {/* passedDays center (moves with progress) */}
            {!isExpired && (
              <span
                className="absolute -translate-x-1/2 font-semibold text-blue-600"
                style={{ left: `${progress}%` }}
              >
                {passedDays}
              </span>
            )}

            {/* total right */}
            <span className="absolute right-0">{totalDays}</span>

            {/* if expired */}
            {isExpired && (
              <span className="absolute right-1/2 translate-x-1/2 font-semibold text-red-600">
                {totalDays}
              </span>
            )}
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-medium">
            {expired.toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">Tugashi</span>
        </div>
      </div>
    </div>
  );
}
