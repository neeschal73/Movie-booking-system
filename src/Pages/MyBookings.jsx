import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import SmartImage from "../components/SmartImage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function MyBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", currentUser.uid)
        );
        const bookingsSnapshot = await getDocs(q);
        const bookingsData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-slate-950 min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight">
            My <span className="text-amber-500">Bookings</span>
          </h1>

          {bookings.length === 0 ? (
            <div className="bg-slate-900/50 rounded-xl p-12 text-center border border-slate-800/80">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Bookings Yet</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                You haven&apos;t booked any tickets yet. Start exploring movies!
              </p>
              <Link
                to="/movies"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Browse Movies
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-900/60 backdrop-blur rounded-xl p-6 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                      <SmartImage
                        path={booking.movieImage || booking.poster_path}
                        alt={booking.movieTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg">{booking.movieTitle}</h3>
                      <p className="text-amber-500 text-sm mt-1">{booking.theatreName}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                        <span>
                          <span className="text-slate-500">Show:</span> {booking.showtime} ({booking.showtimeLabel})
                        </span>
                        <span>
                          <span className="text-slate-500">Seats:</span>{" "}
                          {booking.seats?.join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {booking.status?.toUpperCase()}
                      </span>
                      <p className="text-amber-500 font-bold text-xl">
                        रू{booking.totalPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800">
                    <p className="text-slate-500 text-sm">Booking ID: {booking.id}</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                        Download Ticket
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
