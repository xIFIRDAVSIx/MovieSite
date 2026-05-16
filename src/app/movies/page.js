'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Image from "next/image";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function MoviesPage() {

  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [horror, setHorror] = useState([]);
  const [scifi, setScifi] = useState([]);

  useEffect(() => {

    const fetchMovies = async () => {
      try {
        const [actionRes, comedyRes, horrorRes, scifiRes] = await Promise.all([
          axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878`)
        ]);

        setAction(actionRes.data.results);
        setComedy(comedyRes.data.results);
        setHorror(horrorRes.data.results);
        setScifi(scifiRes.data.results);

      } catch (err) {
        console.log(err);
      }
    };

    fetchMovies();
  }, []);



  const renderRow = (title, movies, type) => (
    <section className="moviesSection">

      <h2 className={`sectionTitle ${type}`}>
        {title}
      </h2>

      <div className="moviesRow">

        {movies?.map((movie) => (
          <Link
            href={`/movie/${movie.id}`}
            className="movieCard"
            key={movie.id}
          >
            <div className="posterWrapper">
              <Image
                className="moviePoster"
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : "/no-image.png"
                }
                alt={movie.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <p className="movieTitle">
              {movie.title}
            </p>

          </Link>
        ))}

      </div>

    </section>
  );

  return (
    <main className="app moviesPage">

      <Navbar />

      {/* HERO HEADER (УЛУЧШЕННЫЙ) */}
      <div className="moviesPageHero">

        <h1 className="moviesPageTitle">
          Movies
        </h1>

        <p className="moviesPageSubtitle">
          Explore thousands of movies by genre
        </p>

      </div>

      {renderRow("🔥 Action", action, "title-action")}
      {renderRow("😂 Comedy", comedy, "title-comedy")}
      {renderRow("👻 Horror", horror, "title-horror")}
      {renderRow("🚀 Sci-Fi", scifi, "title-scifi")}

    </main>
  );
}