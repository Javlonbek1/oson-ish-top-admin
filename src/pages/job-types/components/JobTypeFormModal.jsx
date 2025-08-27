const JobTypeFormModal = ({
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
      className="outline-none px-[20px] fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="outline-none absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="outline-none relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="outline-none text-lg font-semibold mb-4">
          {isEdit ? "Ish turini tahrirlash" : "Ish turi qo‘shish"}
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="outline-none space-y-3"
        >
          {/* NameUz */}
          <div>
            <label className="outline-none block text-sm mb-1">Nomi (Uz)</label>
            <input
              type="text"
              value={form.nameUz}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameUz: e.target.value }))
              }
              className="outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* NameRu */}
          <div>
            <label className="outline-none block text-sm mb-1">Nomi (Ru)</label>
            <input
              type="text"
              value={form.nameRu}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameRu: e.target.value }))
              }
              className="outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* NameEn */}
          <div>
            <label className="outline-none block text-sm mb-1">Nomi (En)</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameEn: e.target.value }))
              }
              className="outline-none w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* isThereTrialPeriod */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isThereTrialPeriod}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  isThereTrialPeriod: e.target.checked,
                }))
              }
              className="peer hidden"
            />
            <span className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <span className="text-sm">Sinov muddati mavjud</span>
          </label>

          {/* Buttons */}
          <div className="outline-none flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="outline-none border-none bg-gray-200 hover:bg-gray-300 transition-colors duration-200 px-4 cursor-pointer py-2 rounded border"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="outline-none px-4 py-2 cursor-pointer rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Qo‘shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobTypeFormModal;
