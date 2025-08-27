import React from "react";

const AreaFilter = ({
  regions,
  selectedRegionId,
  setSelectedRegionId,
  search,
  setSearch,
  handleSearch,
  handleKeyDown,
  pathRegionId,
}) => {
  return (
    <div className="mb-6 flex justify-between flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex gap-2 w-full sm:w-auto">
        <select
          value={selectedRegionId}
          onChange={(e) => setSelectedRegionId(e.target.value)}
          disabled={!!pathRegionId}
          className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-48 focus:outline-none"
        >
          <option value="all">Barcha tumanlar</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.nameUz}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Area qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-64 focus:outline-none"
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Qidirish
        </button>

        {/* Hudud qo'shish tugmasi */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Hudud qo‘shish
        </button>
      </div>
    </div>
  );
};

export default AreaFilter;
