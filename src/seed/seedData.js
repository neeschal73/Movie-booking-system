import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";

// TMDB genre_id to name mapping
const GENRE_MAP = {
  28: "Action", 35: "Comedy", 80: "Crime", 12: "Adventure", 53: "Thriller",
  878: "Sci-Fi", 16: "Animation", 10751: "Family", 9648: "Mystery", 10749: "Romance",
  27: "Horror", 18: "Drama", 14: "Fantasy",
};

// Movies - poster_path, backdrop_path, trailerId (YouTube video ID) stored in Firebase
const TMDB_MOVIES = [
  { id: 1168190, title: "The Wrecking Crew", poster_path: "/gbVwHl4YPSq6BcC92TQpe7qUTh6.jpg", backdrop_path: "/e4OnHU8HNAhdS6C4Ypk6NA26kPQ.jpg", genre_ids: [28, 35, 80], vote_average: 6.7, overview: "Estranged half-brothers Jonny and James reunite after their father's mysterious death. As they search for the truth, buried secrets reveal a conspiracy threatening to tear their family apart.", release_date: "2026-01-28", trailerId: "e4OnHU8HNA" },
  { id: 840464, title: "Greenland 2: Migration", poster_path: "/1mF4othta76CEXcL1YFInYudQ7K.jpg", backdrop_path: "/tyjXlexbNZQ0ZT1KEJslQtBirqc.jpg", genre_ids: [12, 53, 878], vote_average: 6.474, overview: "Having found the safety of the Greenland bunker after the comet Clarke decimated the Earth, the Garrity family must now risk everything to embark on a perilous journey across the wasteland of Europe to find a new home.", release_date: "2026-01-07", trailerId: "BHebKJv4X5g" },
  { id: 1084242, title: "Zootopia 2", poster_path: "/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg", backdrop_path: "/5h2EsPKNDdB3MAtOk9MB9Ycg9Rz.jpg", genre_ids: [16, 35, 12, 10751, 9648], vote_average: 7.6, overview: "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down.", release_date: "2025-11-26", trailerId: "5AwtptT8X8k" },
  { id: 1419406, title: "The Shadow's Edge", poster_path: "/e0RU6KpdnrqFxDKlI3NOqN8nHL6.jpg", backdrop_path: "/4BtL2vvEufDXDP4u6xQjjQ1Y2aT.jpg", genre_ids: [28, 80, 18, 53], vote_average: 7.2, overview: "Macau Police brings the tracking expert police officer out of retirement to help catch a dangerous group of professional thieves.", release_date: "2025-08-16", trailerId: "YoHD9XEInc0" },
  { id: 1234731, title: "Anaconda", poster_path: "/qxMv3HwAB3XPuwNLMhVRg795Ktp.jpg", backdrop_path: "/swxhEJsAWms6X1fDZ4HdbvYBSf9.jpg", genre_ids: [12, 35, 27], vote_average: 5.851, overview: "A group of friends facing mid-life crises head to the rainforest with the intention of remaking their favorite movie from their youth, only to find themselves in a fight for their lives against natural disasters, giant snakes and violent criminals.", release_date: "2025-12-24", trailerId: "2B2vpKtGS6c" },
  { id: 1271895, title: "96 Minutes", poster_path: "/gWKZ1iLhukvLoh8XY2N4tMvRQ2M.jpg", backdrop_path: "/lAtuFCx6cYkNBmTMSNnLE0qlCLx.jpg", genre_ids: [28, 80, 10749], vote_average: 6.381, overview: "Former bomb disposal expert, Song Kang-Ren, and his fiancée, Huang Xin, board a high-speed train that contains a bomb. At the same time, Liu Kai, a well-known physics teacher who was involved in an affair scandal, also boards this same train in order to win back his wife.", release_date: "2025-09-05", trailerId: "kVrqfYjkTdQ" },
  { id: 1601243, title: "Oscar Shaw", poster_path: "/tsE3nySukwrfUjouz8vzvKTcXNC.jpg", backdrop_path: "/6D6M5z4reppUxo2cnBEKI02Csp1.jpg", genre_ids: [28, 80, 53], vote_average: 5.833, overview: "After retiring from the police force, a relentless detective haunted by the tragic loss of his closest friend sets out on a perilous quest for vengeance, seeking redemption and fighting to restore justice to the streets he once swore to protect.", release_date: "2026-01-09", trailerId: "EXeTwQWrcwY" },
  { id: 1310568, title: "Murder at the Embassy", poster_path: "/3DBmBItPdy0A2ol59jgHhS54Lua.jpg", backdrop_path: "/gLXibzLQ4qegvjdqDC0f8yTij2P.jpg", genre_ids: [9648, 53, 28], vote_average: 5.517, overview: "1934. Private detective Miranda Green investigates a murder perpetrated in the British Embassy in Cairo, where a top secret document was stolen, risking to jeopardize both Buckingham Palace and the peace of the world.", release_date: "2025-11-14", trailerId: "5xH0HfJHsaY" },
  { id: 1368166, title: "The Housemaid", poster_path: "/cWsBscZzwu5brg9YjNkGewRUvJX.jpg", backdrop_path: "/tNONILTe9OJz574KZWaLze4v6RC.jpg", genre_ids: [9648, 53], vote_average: 7.075, overview: "Trying to escape her past, Millie Calloway accepts a job as a live-in housemaid for the wealthy Nina and Andrew Winchester. But what begins as a dream job quickly unravels into something far more dangerous.", release_date: "2025-12-18", trailerId: "zAGVQLHvwOY" },
  { id: 1584215, title: "The Internship", poster_path: "/fYqSOkix4rbDiZW0ACNnvZCpT6X.jpg", backdrop_path: "/eUERZRVjCTNdgnESlQxyaOJ2d4K.jpg", genre_ids: [28], vote_average: 6.1, overview: "A CIA-trained assassin recruits other graduates from her secret childhood program, The Internship, to violently destroy the organization. The CIA fights back with deadly force.", release_date: "2026-01-13", trailerId: "vKQi3bBA1y8" },
  { id: 1242898, title: "Predator: Badlands", poster_path: "/pHpq9yNUIo6aDoCXEBzjSolywgz.jpg", backdrop_path: "/ebyxeBh56QNXxSJgTnmz7fXAlwk.jpg", genre_ids: [28, 878, 12], vote_average: 7.756, overview: "Cast out from his clan, a young Predator finds an unlikely ally in a damaged android and embarks on a treacherous journey in search of the ultimate adversary.", release_date: "2025-11-05", trailerId: "7MBgL1IHpkQ" },
  { id: 83533, title: "Avatar: Fire and Ash", poster_path: "/5bxrxnRaxZooBAxgUVBZ13dpzC7.jpg", backdrop_path: "/u8DU5fkLoM5tTRukzPC31oGPxaQ.jpg", genre_ids: [878, 12, 14], vote_average: 7.295, overview: "In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People.", release_date: "2025-12-17", trailerId: "d9MyW72ELq0" },
  { id: 1306368, title: "The Rip", poster_path: "/eZo31Dhl5BQ6GfbMNf3oU0tUvPZ.jpg", backdrop_path: "/3F2EXWF1thX0BdrVaKvnm6mAhqh.jpg", genre_ids: [28, 53, 80], vote_average: 7.023, overview: "Trust frays when a team of Miami cops discovers millions in cash inside a run-down stash house, calling everyone — and everything — into question.", release_date: "2026-01-13", trailerId: "TcMBFSGVi1c" },
  { id: 1167307, title: "David", poster_path: "/bESlrLOrsQ9gKzaGQGHXKOyIUtX.jpg", backdrop_path: "/oN4TQ1TxchynXlFiXFBL3NHLT54.jpg", genre_ids: [16, 10751, 18], vote_average: 8.135, overview: "From the songs of his mother's heart to the whispers of a faithful God, David's story begins in quiet devotion. When the giant Goliath rises to terrorize a nation, a young shepherd armed with only a sling, a few stones, and unshakable faith steps forward.", release_date: "2025-12-14", trailerId: "uYPbbksJxIg" },
  { id: 1043197, title: "Dust Bunny", poster_path: "/vobigFZFvbYPf6ElYJu07P9rH8C.jpg", backdrop_path: "/AecGG1XVCmkk7fT10ko3FC0dLIP.jpg", genre_ids: [28, 14, 53], vote_average: 6.616, overview: "Ten-year-old Aurora asks her hitman neighbor to kill the monster under her bed that she claims ate her family. To protect her, he must battle an onslaught of assassins while accepting that some monsters are real.", release_date: "2025-12-11", trailerId: "n9xhJrPXop4" },
  { id: 755898, title: "War of the Worlds", poster_path: "/yvirUYrva23IudARHn3mMGVxWqM.jpg", backdrop_path: "/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg", genre_ids: [878, 53], vote_average: 4.217, overview: "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something.", release_date: "2025-07-29", trailerId: "iZLqwEwUVi" },
  { id: 1198994, title: "Send Help", poster_path: "/mlV70IuchLZXcXKowjwSpSfdfUB.jpg", backdrop_path: "/eyvIBnJSxZDyek4s7YytUNmtstR.jpg", genre_ids: [27, 53, 35], vote_average: 7, overview: "Two colleagues become stranded on a deserted island, the only survivors of a plane crash. On the island, they must overcome past grievances and work together to survive.", release_date: "2026-01-22", trailerId: "zSWdZVtXT7E" },
  { id: 991494, title: "The SpongeBob Movie: Search for SquarePants", poster_path: "/pDWYW9v8fmJdA7N0I1MOdQA3ETq.jpg", backdrop_path: "/kVSUUWiXoNwq2wVCZ4Mcqkniqvr.jpg", genre_ids: [16, 10751, 35, 12, 14], vote_average: 6.709, overview: "Desperate to be a big guy, SpongeBob sets out to prove his bravery to Mr. Krabs by following The Flying Dutchman – a mysterious swashbuckling ghost pirate – on a seafaring adventure.", release_date: "2025-12-16", trailerId: "3u1CzhhvGec" },
  { id: 1326878, title: "Strangers", poster_path: "/v6hYeC1asK2ZRU7Ygukn4tV1zlS.jpg", backdrop_path: "/xGbNoh7aWmU81oYuxJoFI07Rz5I.jpg", genre_ids: [28, 53, 80], vote_average: 5.8, overview: "Seeking revenge on her abusive husband, a woman's life takes a dark turn when she meets a mysterious hitman. Drawn into a whirlwind romance, she spirals into a dangerous vigilante spree.", release_date: "2024-08-16", trailerId: "5xH0HfJHsaY" },
  { id: 801937, title: "Silent Night, Deadly Night", poster_path: "/xCdSd7NnRdnL8DGLVhI95WhUNoi.jpg", backdrop_path: "/kv8kCuvfhSQ50YxjowqpVn1QqhJ.jpg", genre_ids: [27, 53], vote_average: 6.254, overview: "After witnessing his parents' brutal murder on Christmas Eve, Billy transforms into a Killer Santa, delivering a yearly spree of calculated, chilling violence.", release_date: "2025-12-11", trailerId: "xCdSd7NnRdn" },
];

const THEATRES = [
  { id: "theatre_1", name: "Cineplex Kathmandu", location: "Jamal, Kathmandu", city: "Kathmandu" },
  { id: "theatre_2", name: "Big Movies Nepal", location: "New Road, Kathmandu", city: "Kathmandu" },
  { id: "theatre_3", name: "KTM Cinema Hub", location: "Baneshwor, Kathmandu", city: "Kathmandu" },
  { id: "theatre_4", name: "Pokhara Movie Hub", location: "Lakeside, Pokhara", city: "Pokhara" },
  { id: "theatre_5", name: "Bharatpur Cine World", location: "Bharatpur, Chitwan", city: "Chitwan" },
];

// Premium (rows A-B): रू650 | General (rows C-J): रू350
const SEAT_PRICES = { Premium: 650, General: 350 };

const generateSeats = (showTimeID) => {
  const seats = [];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  rows.forEach((row) => {
    for (let col = 1; col <= 10; col++) {
      const seatId = `${row}${col}`;
      const type = row === "A" || row === "B" ? "Premium" : "General";
      seats.push({
        id: `${showTimeID}_${seatId}`,
        showTimeID,
        seatID: seatId,
        seatId,
        status: "available",
        type,
        price: SEAT_PRICES[type],
      });
    }
  });
  return seats;
};

export const seedFirestore = async (onProgress = (log) => console.log(log)) => {
  try {
    const movieSnap = await getDocs(collection(db, "movies"));
    if (movieSnap.size > 0) {
      onProgress("⚠️ Database already seeded.");
      return;
    }

    onProgress("Movies seeding (from Firebase data, no API)...");

    // Transform TMDB format to Firebase format - all image paths stored in Firebase
    const movies = TMDB_MOVIES.map((m, i) => {
      const movieId = `movie_${i + 1}`;
      const genre = (m.genre_ids || []).map((g) => GENRE_MAP[g] || "Other").filter(Boolean);
      return {
        id: movieId,
        tmdbId: m.id,
        title: m.title,
        image: m.poster_path,
        backdrop: m.backdrop_path,
        genre: genre.length ? genre : ["Movie"],
        rating: m.vote_average || 0,
        synopsis: m.overview || "",
        duration: 120,
        status: "now_showing",
        release_date: m.release_date || "",
        trailerId: m.trailerId || null,
      };
    });

    for (const movie of movies) {
      await setDoc(doc(db, "movies", movie.id), movie);
    }
    onProgress(`  ✓ ${movies.length} movies seeded`);

    onProgress("Theatres seeding...");
    for (const theatre of THEATRES) {
      await setDoc(doc(db, "theatres", theatre.id), theatre);
    }

    onProgress("Showtimes seeding...");
    const SHOWTIMES = [
      { id: "show_1", movieId: "movie_1", theatreId: "theatre_1", time: "10:30", label: "Morning Show" },
      { id: "show_2", movieId: "movie_1", theatreId: "theatre_1", time: "18:45", label: "Evening Show" },
      { id: "show_3", movieId: "movie_2", theatreId: "theatre_2", time: "20:30", label: "Night Show" },
      { id: "show_4", movieId: "movie_2", theatreId: "theatre_1", time: "21:00", label: "Night Show" },
      { id: "show_5", movieId: "movie_3", theatreId: "theatre_3", time: "16:30", label: "Afternoon Show" },
      { id: "show_6", movieId: "movie_4", theatreId: "theatre_2", time: "14:00", label: "Matinee" },
      { id: "show_7", movieId: "movie_5", theatreId: "theatre_1", time: "19:15", label: "Evening Show" },
      { id: "show_8", movieId: "movie_6", theatreId: "theatre_2", time: "22:00", label: "Late Night" },
      { id: "show_9", movieId: "movie_8", theatreId: "theatre_3", time: "20:45", label: "Night Show" },
      { id: "show_10", movieId: "movie_9", theatreId: "theatre_1", time: "17:00", label: "Evening Show" },
      { id: "show_11", movieId: "movie_10", theatreId: "theatre_2", time: "11:00", label: "Morning Show" },
      { id: "show_12", movieId: "movie_11", theatreId: "theatre_3", time: "19:30", label: "Evening Show" },
    ];

    for (const showtime of SHOWTIMES) {
      await setDoc(doc(db, "showtimes", showtime.id), showtime);
    }

    onProgress("Seats seeding...");
    for (const showtime of SHOWTIMES) {
      const seats = generateSeats(showtime.id);
      let batch = writeBatch(db);
      let count = 0;
      for (const seat of seats) {
        batch.set(doc(db, "seats", seat.id), seat);
        count++;
        if (count === 500) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      await batch.commit();
    }

    onProgress("🎉 All data seeded! Movies fetch from Firebase only, images use stored paths.");
  } catch (error) {
    console.error("Seed Error:", error);
    throw error;
  }
};
