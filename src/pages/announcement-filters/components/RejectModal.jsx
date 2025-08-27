import React from 'react'

const RejectModal = ({rejectModal , setReason , setRejectModal}) => {
  return (
    <>
      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[12px] z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Iltimos, bekor qilish sababini kiriting:
            </h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded p-2 mb-4 focus:ring-2 focus:ring-red-400 outline-none"
              rows={3}
              placeholder="Sababni yozing..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal({ open: false, annId: null })}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Yuborish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RejectModal