import React from "react";
import { Link, useLocation } from "react-router-dom";
import SmartImage from "../components/SmartImage";

export default function Confirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="bg-slate-950 min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Booking Found</h1>
          <Link
            to="/movies"
            className="text-amber-500 hover:text-amber-400 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        {/* Success */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
            <svg
              className="w-12 h-12 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-fadeIn">
            Booking Confirmed!
          </h1>
          <p className="text-slate-400 animate-fadeIn">
            Your tickets have been booked successfully
          </p>
        </div>

        {/* Details */}
        <div className="bg-slate-900/60 backdrop-blur rounded-xl p-6 border border-slate-800/80 animate-scaleIn">
          <div className="flex gap-6 mb-6 pb-6 border-b border-slate-800">
            <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
              <SmartImage
                path={booking.movieImage || booking.poster_path}
                alt={booking.movieTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{booking.movieTitle}</h2>
              <p className="text-amber-500 text-sm mt-1">{booking.theatreName}</p>
              <p className="text-slate-400 text-sm">{booking.theatreAddress}</p>
              <p className="text-slate-400 text-sm mt-2">
                {booking.showtime} • {booking.showtimeLabel}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking ID</span>
              <span className="text-white font-mono text-sm">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seats</span>
              <span className="text-white font-medium">
                {booking.seats?.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid</span>
              <span className="text-amber-500 font-bold text-xl">
                रू{booking.totalPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all">
            Download Ticket
          </button>
          <Link to="/my-bookings" className="flex-1">
            <button className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all">
              View My Bookings
            </button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 mb-4">Want to book more movies?</p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/80 text-white font-semibold rounded-xl hover:bg-slate-700 border border-slate-700 transition-all"
          >
            Browse More Movies
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
