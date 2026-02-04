import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    setDoc
} from "firebase/firestore";
import { db } from "../config/firebase";

const MOVIES = [
  {
    id: "movie_1",
    title: "Inception",
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.8,
    synopsis: "A thief who enters dream worlds...",
    duration: 148,
    status: "now_showing"
  },
  {
    id: "movie_2",
    title: "The Dark Knight",
    genre: ["Action", "Drama"],
    rating: 9.0,
    synopsis: "Batman raises the stakes...",
    duration: 152,
    status: "now_showing"
  },
  {
    id: "movie_3",
    title: "Interstellar",
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.6,
    synopsis: "A journey through spacetime...",
    duration: 169,
    status: "coming_soon"
  },
  {
    id: "movie_4",
    title: "Avengers: Endgame",
    genre: ["Action", "Sci-Fi"],
    rating: 8.4,
    synopsis: "The Avengers assemble one last time...",
    duration: 181,
    status: "now_showing"
  },
  {
    id: "movie_5",
    title: "Parasite",
    genre: ["Thriller", "Drama"],
    rating: 8.5,
    synopsis: "A dark tale of class divide...",
    duration: 132,
    status: "now_showing"
  },
  {
    id: "movie_6",
    title: "Joker",
    genre: ["Crime", "Drama"],
    rating: 8.4,
    synopsis: "A troubled man descends into madness...",
    duration: 122,
    status: "now_showing"
  },
  {
    id: "movie_7",
    title: "Dune",
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.1,
    synopsis: "A noble family becomes embroiled in war...",
    duration: 155,
    status: "coming_soon"
  },
  {
    id: "movie_8",
    title: "The Matrix",
    genre: ["Sci-Fi", "Action"],
    rating: 8.7,
    synopsis: "A hacker discovers the truth about reality...",
    duration: 136,
    status: "now_showing"
  },
  {
    id: "movie_9",
    title: "Titanic",
    genre: ["Romance", "Drama"],
    rating: 7.9,
    synopsis: "A love story aboard a doomed ship...",
    duration: 195,
    status: "now_showing"
  },
  {
    id: "movie_10",
    title: "Oppenheimer",
    genre: ["Drama", "History"],
    rating: 8.9,
    synopsis: "The story of the father of the atomic bomb...",
    duration: 180,
    status: "coming_soon"
  }
];
// Theatres
const THEATRES = [
  {
    id: "theatre_1",
    name: "Grand Cinema",
    location: "Downtown"
  },
  {
    id: "theatre_2",
    name: "City Plex",
    location: "Mall Road"
  },
  {
    id: "theatre_3",
    name: "IMAX Arena",
    location: "Tech Park"
  }
];

// Showtimes (movie ↔ theatre mapping)
const SHOWTIMES = [
  {
    id: "show_1",
    movieId: "movie_1",
    theatreId: "theatre_1",
    time: "10:30"
  },
  {
    id: "show_2",
    movieId: "movie_1",
    theatreId: "theatre_1",
    time: "18:45"
  },
  {
    id: "show_3",
    movieId: "movie_1",
    theatreId: "theatre_2",
    time: "20:30"
  },
  {
    id: "show_4",
    movieId: "movie_2",
    theatreId: "theatre_1",
    time: "21:00"
  },
  {
    id: "show_5",
    movieId: "movie_3",
    theatreId: "theatre_3",
    time: "16:30"
  },
  {
    id: "show_6",
    movieId: "movie_4",
    theatreId: "theatre_2",
    time: "14:00"
  },
  {
    id: "show_7",
    movieId: "movie_5",
    theatreId: "theatre_1",
    time: "19:15"
  },
  {
    id: "show_8",
    movieId: "movie_6",
    theatreId: "theatre_2",
    time: "22:00"
  },
  {
    id: "show_9",
    movieId: "movie_8",
    theatreId: "theatre_3",
    time: "20:45"
  },
  {
    id: "show_10",
    movieId: "movie_9",
    theatreId: "theatre_1",
    time: "17:00"
  }
];




// generate seats


function generateseats(showTimeID){
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = 12;


  rows.forEach((row) => {
    for (let col = 1; col <= 10; col++) {
      seats.push({
        id: `${showTimeID}_${row}${col}`,
        showTimeID: showTimeID,
        sheatID: `${row}${col}`,
        status: "available",
        lockedBy: null,
        lockedAt: null,
        bookingId: null,
        type: (row === 'A' || row === 'B') ? 'VIP' : 'Regular',
      })
};
  });
  return seats;
}



//seed data stored
export async function seedFirestore() {
  //checking if the movie already exists
  const movieRef = collection(db, "movies");
  const existingMovies = await getDocs(movieRef);

  //check if we alrready have tthat movies in our database called movies
  if (existingMovies.size > 0) {
    console.log("Movies already seeded.");
    return;
  }

  //if empty, we will seed the data
  console.log("starting the seeding process......")

  // seed/writinf the movies in database
  for (const movie of MOVIES) {
      await setDoc(doc(db, "movies", movie.id), movie);
  }

  console.log("seeding process complete.......")

  // seed theatres
  for (const theatre of THEATRES) {
      await setDoc(doc(db, "theatres", theatre.id), theatre);
  }

  console.log("thearts seeded...");

  // seed showtimes
  for (const showtime of SHOWTIMES) {
      await setDoc(doc(db, "showtimes", showtime.id), showtime);
  }

  console.log("showtimes seeded...");

  // writtting seats
  for (const showtime of SHOWTIMES) {
    const seats = generateseats(showtime.id);
    for (const seat of seats) {
      await setDoc(doc(db, "seats", seat.id), seat);
    }
  }

  console.log("seats created...");

  console.log("seeding complete on firebase !!!")
}