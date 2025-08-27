const DeleteModal = ({ open, onClose, onConfirm, loading }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2">O‘chirishni tasdiqlang</h3>
        <p className="text-sm text-gray-600">
          Ushbu kategoriyani o‘chirmoqchimisiz? Bu amalni ortga qaytarib
          bo‘lmaydi.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "O‘chirilmoqda..." : "O‘chirish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;