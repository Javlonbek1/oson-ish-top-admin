import { memo } from "react";
import Modal from "./Modal";

const CategoryModal = memo(
  ({ isOpen, onClose, form, setForm, onSubmit, isEditing, loading }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="outline-none text-lg font-bold mb-4">
          {isEditing ? "Kategoriya tahrirlash" : "Kategoriya qo‘shish"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="outline-none space-y-3"
        >
          <div>
            <label className=" block text-sm font-medium mb-1">Name (Uz)</label>
            <input
              type="text"
              value={form.nameUz}
              onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
              className="outline-none border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className=" block text-sm font-medium mb-1">Name (Ru)</label>
            <input
              type="text"
              value={form.nameRu}
              onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
              className="outline-none border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className=" block text-sm font-medium mb-1">Name (En)</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="outline-none border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className=" block text-sm font-medium mb-1">Order Number</label>
            <input
              type="number"
              value={form.ordering}
              onChange={(e) => setForm({ ...form, ordering: e.target.value })}
              className="outline-none border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div className="outline-none flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="outline-none cursor-pointer px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="outline-none cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {loading
                ? "Saqlanmoqda..."
                : isEditing
                  ? "Yangilash"
                  : "Qo‘shish"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }
);

export default CategoryModal;
