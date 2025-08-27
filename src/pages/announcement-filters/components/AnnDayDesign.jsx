import React from "react";

const AdProgress = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const passedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
  const remainingDays = totalDays - passedDays;

  const progressPercent = Math.min(
    100,
    Math.max(0, (passedDays / totalDays) * 100)
  );

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>
          {start.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <span className="text-blue-600 font-medium">
          {today.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}{" "}
          (Bugun)
        </span>
        <span>
          {end.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        {/* Progress line */}
        <div
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>

        {/* Today marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"
          style={{ left: `${progressPercent}%`, transform: "translate(-50%, -50%)" }}
        ></div>
      </div>

      {/* Days info */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{passedDays} kun o‘tgan</span>
        <span>{remainingDays > 0 ? `${remainingDays} kun qoldi` : "Tugagan"}</span>
      </div>
    </div>
  );
};

export default AdProgress;
