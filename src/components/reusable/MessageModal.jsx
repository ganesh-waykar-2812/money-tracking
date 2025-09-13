import React from "react";
import Modal from "./Modal";

export default function MessageModal({
  show,
  onClose,
  type = "success",
  message,
}) {
  const color =
    type === "success"
      ? "text-green-700"
      : type === "error"
      ? "text-red-700"
      : "text-gray-700";

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={type === "success" ? "Success" : "Error"}
      zIndex={2000}
    >
      <div className={`text-center text-lg font-semibold ${color}`}>
        {message}
      </div>
    </Modal>
  );
}
