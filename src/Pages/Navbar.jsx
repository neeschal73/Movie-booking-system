import React, { useState } from "react"
import { Link, NavLink } from "react-router-dom"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              MovieBooking
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? "font-semibold underline" : "hover:underline"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/movies"
              className={({ isActive }) =>
                isActive ? "font-semibold underline" : "hover:underline"
              }
            >
              Movies
            </NavLink>
            <NavLink
              to="/booking"
              className={({ isActive }) =>
                isActive ? "font-semibold underline" : "hover:underline"
              }
            >
              My Bookings
            </NavLink>
          </div>

          {/* Login/Register Buttons Desktop */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/login"
              className="px-3 py-1 rounded-md bg-white text-blue-600 font-medium hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 rounded-md bg-white text-blue-600 font-medium hover:bg-gray-100"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none focus:ring-2 focus:ring-white"
            >
              {isOpen ? (
                <span className="text-2xl">✖</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-600 px-4 pt-2 pb-4 space-y-2">
          <NavLink
            to="/home"
            className="block text-white hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/movies"
            className="block text-white hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Movies
          </NavLink>
          <NavLink
            to="/booking"
            className="block text-white hover:underline"
            onClick={() => setIsOpen(false)}
          >
            My Bookings
          </NavLink>
          <Link
            to="/login"
            className="block px-3 py-1 rounded-md bg-white text-blue-600 text-center"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block px-3 py-1 rounded-md bg-white text-blue-600 text-center"
            onClick={() => setIsOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  )
}
