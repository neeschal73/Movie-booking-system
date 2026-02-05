import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/authcontext";

// Move constant outside to prevent unnecessary re-renders
const API_KEY = "80d491707d8cf7b38aa19c7ccab0952f";
const BASE_URL = "https://api.themoviedb.org/3";

export default function Home() {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`);
        const data = await response.json();
        
        const results = data.results || [];
        setMovies(results);
        
        // Filter for high-quality backdrops for the hero section
        const heroItems = results
          .filter((m) => m.backdrop_path && m.vote_average > 6)
          .slice(0, 5);
        setFeaturedMovies(heroItems);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Memoized navigation to prevent effect re-runs
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const timer = setInterval(nextSlide, 8000); // Increased to 8s for better readability
    return () => clearInterval(timer);
  }, [nextSlide, featuredMovies.length]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Setting the stage...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen selection:bg-red-500/30">
      {/* Hero Slideshow */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
            }`}
          >
            {/* Optimized Image Loading */}
            <div className="absolute inset-0">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="w-full h-full object-cover object-top"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
            </div>
            
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <div className="max-w-2xl mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-red-600 text-xs font-bold uppercase tracking-widest rounded">New Release</span>
                  <span className="text-yellow-400 font-bold">★ {movie.vote_average.toFixed(1)}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight drop-shadow-2xl">
                  {movie.title}
                </h1>
                <p className="text-gray-300 text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl">
                  {movie.overview}
                </p>
                <div className="flex gap-4">
                  <Link
                    to={`/movies/${movie.id}`}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center"
                  >
                    Get Tickets
                  </Link>
                  <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold rounded-lg transition-all">
                    Watch Trailer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
            <button onClick={prevSlide} className="p-2 text-white/50 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex gap-2">
                {featuredMovies.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1 transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 bg-red-600" : "w-4 bg-gray-600"}`}
                    />
                ))}
            </div>
            <button onClick={nextSlide} className="p-2 text-white/50 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-bold">Trending Now</h2>
                <div className="h-1 w-12 bg-red-600 mt-2"></div>
            </div>
            <Link to="/movies" className="text-red-500 hover:text-red-400 font-medium text-sm transition-colors">VIEW ALL MOVIES</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {movies.slice(0, 10).map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="group relative">
              <div className="overflow-hidden rounded-2xl bg-gray-900 aspect-[2/3] shadow-xl group-hover:shadow-red-900/20 transition-all duration-500">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <button className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        QUICK BOOK
                    </button>
                </div>
              </div>
              <h3 className="mt-4 font-bold text-gray-100 line-clamp-1 group-hover:text-red-500 transition-colors">
                {movie.title}
              </h3>
              <p className="text-gray-500 text-sm">{movie.release_date?.split("-")[0]}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}