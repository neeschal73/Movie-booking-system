import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import SmartImage from "../components/SmartImage";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        const moviesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(moviesData);
        const heroItems = [...moviesData]
          .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
          .slice(0, 5);
        setFeaturedMovies(heroItems);
      } catch (err) {
        console.error("Firestore fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const nextSlide = useCallback(() => {
    if (featuredMovies.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, featuredMovies.length]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-semibold uppercase tracking-widest">Loading Cinema...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <SmartImage
              path={movie.backdrop || movie.image}
              size="w1280"
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />

            <div className="absolute bottom-28 left-8 md:left-20 max-w-3xl z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-widest rounded">
                  Featured
                </span>
                <span className="text-amber-400 font-bold">★ {movie.rating}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black mb-8 uppercase italic leading-none drop-shadow-2xl">
                {movie.title}
              </h1>
              <Link
                to={`/movies/${movie.id}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold rounded-full uppercase tracking-wider text-sm hover:bg-amber-500 hover:text-slate-900 transition-all"
              >
                Book Tickets
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {featuredMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? "bg-amber-500 w-8" : "bg-slate-500 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 tracking-tight">
          Trending <span className="text-amber-500">Now</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 shadow-lg relative border border-slate-800/80 group-hover:border-amber-500/40 transition-all duration-300">
                <SmartImage
                  path={movie.image}
                  size="w500"
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-sm uppercase tracking-tight group-hover:text-amber-400 transition-colors truncate">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">
                  ★ {movie.rating} | {movie.genre?.[0] || "Cinema"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
