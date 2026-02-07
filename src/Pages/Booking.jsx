import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import { db } from "../config/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import SmartImage from "../components/SmartImage";

const SEAT_PRICES = { Premium: 650, General: 350, VIP: 650, Regular: 350 };

const SeatIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 18V6a2 2 0 012-2h6a2 2 0 012 2v12M7 18h10M7 18v2m10-2v2M7 10h10" />
  </svg>
);

export default function Booking() {
  const { id: showtimeId } = useParams();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [processing, setProcessing] = useState(false);
  const [seatsLoaded, setSeatsLoaded] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!showtimeId) return;
      setLoading(true);
      try {
        const showtimeSnap = await getDoc(doc(db, "showtimes", showtimeId));
        if (!showtimeSnap.exists()) {
          navigate("/movies");
          return;
        }
        const showtimeData = { id: showtimeSnap.id, ...showtimeSnap.data() };
        setShowtime(showtimeData);

        const movieSnap = await getDoc(doc(db, "movies", showtimeData.movieId));
        if (movieSnap.exists()) {
          setMovie({ id: movieSnap.id, ...movieSnap.data() });
        }

        const theatreSnap = await getDoc(doc(db, "theatres", showtimeData.theatreId));
        if (theatreSnap.exists()) {
          setTheatre({ id: theatreSnap.id, ...theatreSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
        navigate("/movies");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showtimeId, navigate]);

  const generateSeats = useCallback((sid) => {
    const seats = [];
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    rows.forEach((row) => {
      for (let col = 1; col <= 10; col++) {
        const seatId = `${row}${col}`;
        const type = row === "A" || row === "B" ? "Premium" : "General";
        seats.push({
          id: `${sid}_${seatId}`,
          showTimeID: sid,
          seatID: seatId,
          seatId,
          status: "available",
          type,
          price: SEAT_PRICES[type],
        });
      }
    });
    return seats;
  }, []);

  const fetchSeats = useCallback(async () => {
    if (!showtimeId) return;
    setSeatsLoaded(false);
    try {
      const q = query(
        collection(db, "seats"),
        where("showTimeID", "==", showtimeId)
      );
      const seatsSnapshot = await getDocs(q);
      const seatsData = seatsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        seatId: d.data().seatID || d.data().seatId,
      }));

      if (seatsData.length > 0) {
        setSeats(seatsData);
      } else {
        const generated = generateSeats(showtimeId);
        setSeats(generated);
      }
    } catch (error) {
      console.error("Error fetching seats:", error);
      setSeats(generateSeats(showtimeId));
    } finally {
      setSeatsLoaded(true);
    }
  }, [showtimeId, generateSeats]);

  useEffect(() => {
    if (showtimeId && step === 2) {
      fetchSeats();
    }
  }, [showtimeId, step, fetchSeats]);

  const handleSeatToggle = (seat) => {
    if (seat.status === "booked") return;
    setSelectedSeats((prev) => {
      const isSelected = prev.find((s) => s.id === seat.id);
      if (isSelected) return prev.filter((s) => s.id !== seat.id);
      return [...prev, seat];
    });
  };

  const getSeatPrice = (seat) => seat.price ?? SEAT_PRICES[seat.type] ?? SEAT_PRICES.General;
  const getTotalPrice = () => selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  const getTotalWithTax = () => {
    const subtotal = getTotalPrice();
    return subtotal + Math.round(subtotal * 0.13);
  };

  const handleContinueToSeats = () => setStep(2);

  const handlePayment = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    try {
      for (const seat of selectedSeats) {
        const seatRef = doc(db, "seats", seat.id);
        await updateDoc(seatRef, {
          status: "booked",
          bookedBy: currentUser.uid,
          bookedAt: serverTimestamp(),
        });
      }

      const bookingData = {
        id: `booking_${Date.now()}`,
        userId: currentUser.uid,
        userEmail: currentUser.email ?? "",
        userName: userData?.name || currentUser.displayName || "",
        movieId: movie?.id ?? "",
        movieTitle: movie?.title ?? "",
        movieImage: movie?.image ?? null,
        theatreId: theatre?.id ?? "",
        theatreName: theatre?.name ?? "",
        theatreAddress: theatre?.location ?? "",
        showtimeId,
        showtime: showtime?.time ?? "",
        showtimeLabel: showtime?.label ?? "",
        seats: selectedSeats.map((s) => s.seatId || s.seatID),
        seatTypes: selectedSeats.map((s) => ({
          seat: s.seatId || s.seatID,
          type: s.type ?? "General",
          price: getSeatPrice(s),
        })),
        subtotal: getTotalPrice(),
        tax: Math.round(getTotalPrice() * 0.13),
        totalPrice: getTotalWithTax(),
        currency: "NPR",
        paymentMethod: paymentMethod ?? "esewa",
        paymentStatus: "completed",
        status: "confirmed",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "bookings", bookingData.id), bookingData);
      navigate("/confirmation", { state: { booking: bookingData } });
    } catch (error) {
      console.error("Error booking:", error);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const isPremium = (seat) => seat.type === "Premium" || seat.type === "VIP";

  const renderSeatGrid = () => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    if (!seatsLoaded || seats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 border-2 border-amber-500/50 border-t-amber-500 rounded-full animate-spin mb-5" />
          <p className="text-slate-400 text-sm">Loading seats...</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto px-2">
        <div className="inline-block min-w-0 max-w-full">
          <div className="relative mb-10">
            <div className="h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full" />
            <p className="text-center text-slate-500 text-xs font-semibold mt-3 tracking-[0.3em] uppercase">Screen</p>
          </div>

          <div className="space-y-2.5">
            {rows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-2">
                <span className="w-7 text-slate-500 text-xs font-semibold tabular-nums">{row}</span>
                <div className="flex gap-2 justify-center">
                  {seats
                    .filter((s) => (s.seatId || s.seatID || "").startsWith(row))
                    .sort((a, b) => (a.seatId || a.seatID || "").localeCompare(b.seatId || b.seatID || ""))
                    .map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.id === seat.id);
                      const isBooked = seat.status === "booked";
                      const premium = isPremium(seat);

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatToggle(seat)}
                          onMouseEnter={() => !isBooked && setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={isBooked}
                          title={`${seat.seatId || seat.seatID} • ${seat.type} • रू${getSeatPrice(seat)}`}
                          className={`
                            flex flex-col items-center justify-center w-11 h-11 rounded-lg transition-all duration-200
                            ${isBooked
                              ? "bg-slate-700/80 cursor-not-allowed opacity-60"
                              : isSelected
                                ? "bg-amber-500 text-slate-900 scale-110 shadow-lg shadow-amber-500/50 ring-2 ring-amber-400/80"
                                : premium
                                  ? "bg-amber-500/25 text-amber-400 hover:bg-amber-500/45 hover:scale-105 border border-amber-500/40"
                                  : "bg-emerald-500/25 text-emerald-400 hover:bg-emerald-500/45 hover:scale-105 border border-emerald-500/40"
                            }
                          `}
                        >
                          <SeatIcon className="w-5 h-5" />
                          <span className="text-[10px] font-bold mt-0.5">{(seat.seatId || seat.seatID || "").replace(row, "")}</span>
                        </button>
                      );
                    })}
                </div>
                <span className="w-7 text-slate-500 text-xs font-semibold tabular-nums">{row}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 py-4 px-6 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-center w-10 h-10 rounded-lg bg-emerald-500/30 border border-emerald-500/50">
                <SeatIcon className="w-4 h-4 text-emerald-400 mt-1" />
              </div>
              <span className="text-slate-300 text-sm">General — रू{SEAT_PRICES.General}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-center w-10 h-10 rounded-lg bg-amber-500/30 border border-amber-500/50">
                <SeatIcon className="w-4 h-4 text-amber-400 mt-1" />
              </div>
              <span className="text-slate-300 text-sm">Premium — रू{SEAT_PRICES.Premium}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-center w-10 h-10 rounded-lg bg-amber-500">
                <SeatIcon className="w-4 h-4 text-slate-900 mt-1" />
              </div>
              <span className="text-slate-300 text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-center w-10 h-10 rounded-lg bg-slate-600/80 opacity-70">
                <SeatIcon className="w-4 h-4 text-slate-400 mt-1" />
              </div>
              <span className="text-slate-300 text-sm">Booked</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !movie) {
    return (
      <div className="bg-slate-950 min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!movie || !showtime || !theatre) {
    return (
      <div className="bg-slate-950 min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Showtime not found</p>
          <Link to="/movies" className="text-amber-500 hover:text-amber-400">Browse Movies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen pt-20">
      <header className="bg-slate-900/50 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Link
            to={`/movies/${movie.id}`}
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Movie
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{movie.title}</h1>
          <p className="text-slate-400 mt-1.5 flex items-center gap-2 text-sm">
            <span className="text-amber-500 font-medium">{theatre.name}</span>
            <span className="text-slate-600">•</span>
            <span>{showtime.time}</span>
            <span className="text-slate-500">({showtime.label})</span>
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-center gap-3 mb-14">
          {[
            { num: 1, label: "Review" },
            { num: 2, label: "Seats" },
            { num: 3, label: "Payment" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s.num ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s.num ? "text-white" : "text-slate-500"}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-12 sm:w-20 h-1 mx-1 rounded ${step > s.num ? "bg-amber-500" : "bg-slate-800"}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="max-w-xl mx-auto animate-fadeIn">
            <div className="bg-slate-900/70 backdrop-blur rounded-2xl p-8 border border-slate-800/80 shadow-xl">
              <div className="flex gap-6">
                <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-slate-700">
                  <SmartImage path={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{movie.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">{theatre.name}</p>
                  <p className="text-amber-500 font-mono text-sm mt-2">{showtime.time} — {showtime.label}</p>
                  <p className="text-slate-500 text-xs mt-1">{theatre.location}, {theatre.city}</p>
                </div>
              </div>
              <button
                onClick={handleContinueToSeats}
                className="w-full mt-8 py-3.5 bg-amber-500 text-slate-900 font-semibold rounded-xl hover:bg-amber-400 transition-colors"
              >
                Select Seats →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Select Your Seats</h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    ← Change
                  </button>
                </div>
                {renderSeatGrid()}
              </div>

              <div className="lg:w-96">
                <div className="sticky top-24 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-4">Seat Information</h3>

                  {hoveredSeat && !selectedSeats.some((s) => s.id === hoveredSeat.id) && hoveredSeat.status !== "booked" && (
                    <div className="mb-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700 animate-fadeIn">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Hovering</p>
                      <p className="text-white font-mono font-bold">{hoveredSeat.seatId || hoveredSeat.seatID}</p>
                      <p className={isPremium(hoveredSeat) ? "text-amber-400 text-sm" : "text-emerald-400 text-sm"}>
                        {isPremium(hoveredSeat) ? "Premium" : "General"} — रू{getSeatPrice(hoveredSeat)}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">Click to select</p>
                    </div>
                  )}

                  {selectedSeats.length > 0 ? (
                    <>
                      <div className="space-y-2.5 mb-4 max-h-52 overflow-y-auto custom-scrollbar">
                        {selectedSeats.map((seat) => (
                          <div
                            key={seat.id}
                            className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-500/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <SeatIcon className="w-4 h-4 text-amber-400" />
                              </div>
                              <div>
                                <span className="font-mono font-bold text-amber-400">{seat.seatId || seat.seatID}</span>
                                <span className="text-slate-500 text-xs ml-2">{isPremium(seat) ? "Premium" : "General"}</span>
                              </div>
                            </div>
                            <span className="text-white font-semibold">रू{getSeatPrice(seat)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-700 pt-4 space-y-2">
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal</span>
                          <span className="text-white">रू{getTotalPrice()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>VAT (13%)</span>
                          <span className="text-white">रू{Math.round(getTotalPrice() * 0.13)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-white pt-2">
                          <span>Total</span>
                          <span className="text-amber-500">रू{getTotalWithTax()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(3)}
                        className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
                      >
                        Proceed to Payment →
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-800/80 flex items-center justify-center">
                        <SeatIcon className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm font-medium">Click on seats to select</p>
                      <p className="text-xs mt-1 text-slate-600">Premium (रू650) • General (रू350)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xl mx-auto animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Payment</h2>
            <div className="bg-slate-900/70 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-800/80">
              <div className="flex gap-6 mb-6">
                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <SmartImage path={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-semibold">{movie.title}</p>
                  <p className="text-slate-400 text-sm">{theatre.name}</p>
                  <p className="text-slate-400 text-sm">{showtime.time} ({showtime.label})</p>
                  <p className="text-amber-500 text-sm">{theatre.location}</p>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Seats ({selectedSeats.length})</span>
                  <span>रू{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT (13%)</span>
                  <span>रू{Math.round(getTotalPrice() * 0.13)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-slate-700">
                  <span>Total</span>
                  <span className="text-amber-500">रू{getTotalWithTax()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-800/80">
              <h3 className="text-base font-semibold text-white mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {["esewa", "khalti", "card", "cash"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      paymentMethod === method
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-2xl">{["esewa", "khalti", "card", "cash"].indexOf(method) === 0 ? "💚" : method === "khalti" ? "💜" : method === "card" ? "💳" : "💵"}</span>
                    <p className="text-white font-medium mt-2 capitalize">{method === "esewa" ? "eSewa" : method === "khalti" ? "Khalti" : method === "card" ? "Card" : "Cash at Counter"}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>Pay रू{getTotalWithTax()} securely</>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
