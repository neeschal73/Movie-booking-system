import React from "react";
import { Link } from "react-router-dom";
import SmartImage from "./SmartImage";

export default function MovieCard({ movie }) {
  if (!movie) return null;

  const formatRating = (rating) => {
    const r = parseFloat(rating);
    if (r >= 8) return { label: "Great", color: "text-emerald-400", bg: "bg-emerald-400/20" };
    if (r >= 6) return { label: "Good", color: "text-amber-400", bg: "bg-amber-400/20" };
    return { label: "Avg", color: "text-slate-400", bg: "bg-slate-400/20" };
  };

  const rating = formatRating(movie.rating || movie.vote_average || 0);

  return (
    <Link to={`/movies/${movie.id}`} className="group">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 transform group-hover:scale-[1.02] transition-all duration-300 shadow-lg group-hover:shadow-amber-500/10 border border-slate-700/50">
        <SmartImage
          path={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${rating.bg} ${rating.color}`}
        >
          {(movie.rating || movie.vote_average || 0).toFixed(1)}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-semibold text-sm line-clamp-2 mb-2">
              {movie.title}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">
                {movie.release_date?.split("-")[0] || movie.duration + " min"}
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-amber-500 text-slate-900 text-xs rounded font-medium">
                Book
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
