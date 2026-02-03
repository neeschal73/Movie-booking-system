import React from "react"
import { Link } from "react-router-dom"

// Sample movie data
const movies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    image: "https://via.placeholder.com/200x300?text=Avengers",
    genre: "Action",
  },
  {
    id: 2,
    title: "Inception",
    image: "https://via.placeholder.com/200x300?text=Inception",
    genre: "Sci-Fi",
  },
  {
    id: 3,
    title: "Joker",
    image: "https://via.placeholder.com/200x300?text=Joker",
    genre: "Thriller",
  },
  {
    id: 4,
    title: "The Lion King",
    image: "https://via.placeholder.com/200x300?text=Lion+King",
    genre: "Animation",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Featured Movies
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition duration-300">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-60 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-500">{movie.genre}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
