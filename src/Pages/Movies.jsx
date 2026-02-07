import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import SmartImage from "../components/SmartImage";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        setMovies(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const genres = useMemo(() => {
    const set = new Set(["All"]);
    movies.forEach((m) => {
      const g = Array.isArray(m.genre) ? m.genre : [m.genre];
      g.forEach((x) => x && set.add(x));
    });
    return [...set];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const title = movie.title || "";
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const genresList = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
      const matchesGenre =
        selectedGenre === "All" || genresList.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  if (loading)
    return (
      <div className="pt-40 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 uppercase tracking-widest">Loading Movies...</p>
      </div>
    );

  return (
    <div className="bg-slate-950 min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Explore <span className="text-amber-500">All</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-xl text-white w-full md:w-72 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGenre === g
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <Link
              to={`/movies/${movie.id}`}
              key={movie.id}
              className="group"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 relative shadow-lg border border-slate-800/80 group-hover:border-amber-500/40 transition-all duration-300">
                <SmartImage
                  path={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-amber-400">
                  ★ {movie.rating}
                </div>
              </div>
              <h3 className="mt-4 font-bold uppercase text-sm tracking-tight group-hover:text-amber-400 transition-colors truncate">
                {movie.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
              </p>
            </Link>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500">No movies match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
