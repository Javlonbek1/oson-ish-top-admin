import React, { memo } from "react";

const Modal = memo(({ isOpen, onClose, children, maxWidth = "max-w-md" }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed  px-[20px] inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>
      <div
        className={`relative bg-white rounded-lg p-6 w-full ${maxWidth} shadow-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
});

export default Modal;
