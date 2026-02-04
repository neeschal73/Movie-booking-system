import React from "react"

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">

      <div className="bg-gray-800 p-8 rounded-lg w-96 text-white">
        <h2 className="text-2xl mb-4 text-center">Register</h2>

        <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="Name" />
        <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="Email" />
        <input className="w-full p-2 mb-3 rounded bg-gray-700" placeholder="Password" type="password" />

        <button className="w-full bg-red-500 py-2 rounded hover:bg-red-600">
          Create Account
        </button>
      </div>
    </div>
  )
}
