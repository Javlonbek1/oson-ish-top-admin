import React from "react";

const ModalBase = ({ show, onClose, children }) => {
  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-[468px] max-sm:w-[95%] shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default ModalBase;
