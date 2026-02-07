import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import { db } from "../config/firebase";
import { getDoc, doc, collection, getDocs, query, where } from "firebase/firestore";
import SmartImage from "../components/SmartImage";

export default function MovieDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [theatres, setTheatres] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      setLoading(true);
      try {
        const movieSnap = await getDoc(doc(db, "movies", id));
        if (movieSnap.exists()) {
          const movieData = { id: movieSnap.id, ...movieSnap.data() };
          setMovie(movieData);

          const showtimesQuery = query(
            collection(db, "showtimes"),
            where("movieId", "==", id)
          );
          const showtimesSnap = await getDocs(showtimesQuery);
          const showtimesList = showtimesSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setShowtimes(showtimesList);

          const theatreSnap = await getDocs(collection(db, "theatres"));
          const theatreData = {};
          theatreSnap.docs.forEach((d) => {
            theatreData[d.id] = d.data();
          });
          setTheatres(theatreData);
        }
      } catch (err) {
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  const handleBookTicket = (showtimeId) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate(`/booking/${showtimeId}`);
  };

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (!movie)
    return (
      <div className="bg-slate-950 min-h-screen pt-24 flex items-center justify-center">
        <p className="text-slate-400">Movie not found.</p>
      </div>
    );

  return (
    <div className="bg-slate-950 text-white min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[45vh] md:h-[65vh] overflow-hidden">
        <SmartImage
          path={movie.backdrop || movie.image}
          size="w1280"
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold uppercase rounded border border-amber-500/30">
              {movie.status?.replace("_", " ")}
            </span>
            <span className="text-amber-400 font-bold">★ {movie.rating}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">
            {movie.title}
          </h1>
          <p className="text-slate-300 max-w-xl">
            {Array.isArray(movie.genre) ? movie.genre.join(" • ") : movie.genre} • {movie.duration} mins
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Trailer & Story */}
          <div className="flex-1">
            <div className="bg-slate-900/80 backdrop-blur rounded-xl overflow-hidden shadow-xl border border-slate-800/80 aspect-video">
              {movie.trailerId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=0&rel=0`}
                  title={`${movie.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50">
                  <svg className="w-20 h-20 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-500 italic">Trailer coming soon</p>
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-10 h-1 bg-amber-500 rounded-full" />
                Storyline
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                {movie.synopsis}
              </p>
            </div>
          </div>

          {/* Right: Showtimes */}
          <div className="w-full lg:w-96">
            <div className="sticky top-24 bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-slate-800/80 shadow-xl">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available Shows
              </h3>

              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {showtimes.length > 0 ? (
                  showtimes.map((show) => (
                    <button
                      key={show.id}
                      onClick={() => handleBookTicket(show.id)}
                      className="w-full text-left p-4 rounded-xl bg-slate-800/50 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/40 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                          {theatres[show.theatreId]?.name || "—"}
                        </p>
                        <span className="text-amber-500 font-mono text-sm font-semibold">{show.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {theatres[show.theatreId]?.location}
                      </div>
                      <p className="text-amber-500/80 text-xs mt-0.5">{show.label}</p>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-500">No showtimes available for this movie.</p>
                  </div>
                )}
              </div>

              <p className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                Select a showtime to choose your seats
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
