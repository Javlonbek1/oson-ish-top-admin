const FormModal = ({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  loading,
  isEdit,
}) => {
  if (!open) return null;
  return (
    <div
      className=" outline-none px-[20px] fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className=" outline-none absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div
        className=" outline-none relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className=" outline-none text-lg font-semibold mb-4">
          {isEdit ? "Ichki kategoriyani tahrirlash" : "Ichki kategoriya qo‘shish"}
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className=" outline-none space-y-3"
        >
          <div>
            <label className=" outline-none block text-sm mb-1">Sarlavha (Uz)</label>
            <input
              type="text"
              value={form.nameUz}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameUz: e.target.value }))
              }
              className=" outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className=" outline-none block text-sm mb-1">Sarlavha (Ru)</label>
            <input
              type="text"
              value={form.nameRu}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameRu: e.target.value }))
              }
              className=" outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className=" outline-none block text-sm mb-1">Sarlavha (En)</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameEn: e.target.value }))
              }
              className=" outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className=" outline-none block text-sm mb-1">Order Number</label>
            <input
              type="number"
              value={form.ordering}
              onChange={(e) =>
                setForm((p) => ({ ...p, ordering: e.target.value }))
              }
              className="outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className=" outline-none flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className=" outline-none border-none bg-gray-200 hover:bg-gray-300 transition-colors duration-200 px-4 cursor-pointer py-2 rounded border "
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className=" outline-none px-4 py-2 cursor-pointer rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Qo‘shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default FormModal;