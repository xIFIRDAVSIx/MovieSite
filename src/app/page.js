'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Link from "next/link";
import Image from "next/image";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {

    const fetchMovies = async () => {
      try {
        const trending = await axios.get(
          `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
        );

        const top = await axios.get(
          `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`
        );

        const pop = await axios.get(
          `${BASE_URL}/movie/popular?api_key=${API_KEY}`
        );

        const trendingData = trending.data?.results || [];
        const topData = top.data?.results || [];
        const popData = pop.data?.results || [];

        setMovies(trendingData);
        setTopRated(topData);
        setPopular(popData);

        const random =
          trendingData[Math.floor(Math.random() * trendingData.length)];

        setFeatured(random);

      } catch (err) {
        console.error("API error:", err);
      }
    };

    fetchMovies();
  }, []);


  // modalOverlay
  const openTrailer = async (movieId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
      );

      const videos = res.data.results;

      const trailer = videos.find(
        (v) => v.site === "YouTube" && v.type === "Trailer"
      );

      if (trailer) {
        setTrailerKey(trailer.key);
      } else {
        alert("Trailer not found");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="app">

      {/* NAVBAR */}
      <Navbar openMovie={openTrailer} />

      {/* HERO */}
      {featured && (
        <section
          className="hero"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`,
          }}
        >
          <div className="heroOverlay" />

          <div className="heroContent">

            <h1 className="heroTitle">
              {featured?.title}
            </h1>

            <p className="heroMeta">
              <span className="ratingGlow">
                ★ {featured?.vote_average?.toFixed(1)} / 10
              </span>

              <span className="divider">•</span>

              <span>
                {featured?.release_date}
              </span>
            </p>

            <p className="heroDescription">
              {featured?.overview?.length > 180
                ? featured.overview.slice(0, 180) + "..."
                : featured?.overview}
            </p>

            <div className="heroButtons">
              <button
                className="btnPrimary"
                onClick={() => openTrailer(featured.id)}
              >
                ▶ Watch Trailer
              </button>

              <Link href={`/movie/${featured?.id}`}>
                <button className="btnSecondary">
                  More Info
                </button>
              </Link>

            </div>
          </div>
        </section>
      )}

      {/* TRENDING */}
      <section className="moviesSection">
        <h2 className="sectionTitle">Trending Now</h2>

        <div className="moviesRow">
          {movies.map((movie) => (
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
                  sizes="(max-width: 768px) 150px, 300px"
                />
              </div>

              <p className="movieTitle">
                {movie.title?.length > 25
                  ? movie.title.slice(0, 25) + "..."
                  : movie.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="moviesSection">
        <h2 className="sectionTitle">Top Rated</h2>

        <div className="moviesRow">
          {topRated.map((movie) => (
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
                  sizes="(max-width: 768px) 150px, 300px"
                />
              </div>

              <p className="movieTitle">
                {movie.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="moviesSection">
        <h2 className="sectionTitle">Popular</h2>

        <div className="moviesRow">
          {popular.map((movie) => (
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
                  sizes="(max-width: 768px) 150px, 300px"
                />
              </div>

              <p className="movieTitle">
                {movie.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* TRAILER MODAL */}
      {trailerKey && (
        <div className="modalOverlay" onClick={() => setTrailerKey(null)}>

          <div className="modalContent" onClick={(e) => e.stopPropagation()}>

            <iframe
              className="movieTrailer"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />

            <button className="modalClose" onClick={() => setTrailerKey(null)}>
              ✕
            </button>

          </div>

        </div>
      )}

    </main>
  );
}