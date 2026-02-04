import React from "react"

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">

      <div className="bg-gray-800 text-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Confirm Logout
        </h2>

        <p className="text-gray-300 text-center mb-6">
          Are you sure you want to logout from your account?
        </p>

        <div className="flex justify-center gap-4">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-gray-600 hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>
      </div>

    </div>
  )
}
