'use client';

import { useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";


const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;

export default function Navbar({ variant = "home", openMovie }) {

  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const timeoutRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const controllerRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;

    setText(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);

        // ❗ cancel previous request
        if (controllerRef.current) {
          controllerRef.current.abort();
        }

        controllerRef.current = new AbortController();

        const res = await axios.get(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${value}`,
          { signal: controllerRef.current.signal }
        );

        setResults(res.data.results.slice(0, 6));

      } catch (err) {
        if (err.name !== "CanceledError") {
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const clearSearch = () => {
    setText("");
    setResults([]);
    setFocused(false);
  };

  return (
    <nav className="navbar">

      {/* LEFT */}
      <div className="navbarLeft">

        <h2 className="logo">
          NONAME
        </h2>

        <ul className="navLinks ">
          <li className={pathname === "/" ? "active" : ""}>
            <Link href="/">Home</Link>
          </li>

          <li className={pathname === "/movies" ? "active" : ""}>
            <Link href="/movies">Movies</Link>
          </li>

          <li className={pathname === "/trending" ? "active" : ""}>
            <Link href="/trending">Trending</Link>
          </li>

          <li className={pathname === "/my-list" ? "active" : ""}>
            <Link href="/my-list">My List</Link>
          </li>
        </ul>

      </div>

      {/* RIGHT */}
      <div className="navbarRight">

        <div className="searchWrapper">

          <input
            className={`searchInput ${focused ? "expanded" : ""}`}
            placeholder="Search movies..."
            value={text}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                setResults([]);
                setFocused(false);
              }, 150);
            }}
          />

          {(results.length > 0 || loading) && (
            <div className="searchDropdown">

              {loading && (
                <div className="searchLoading">
                  Loading...
                </div>
              )}

              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="searchItem"
                  onClick={() => {
                    router.push(`/movie/${movie.id}`);
                    clearSearch();
                  }}
                >

                  <div className="posterSmall">
                    <Image
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          : "https://via.placeholder.com/50x75?text=No"
                      }
                      alt={movie.title}
                      fill
                      sizes="50px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="movieInfo">

                    <span className="movieSearchTitle">
                      {movie.title}
                    </span>

                    <span className="movieYear">
                      {movie.release_date?.slice(0, 4)}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        <div className="profileCircle" />

      </div>

    </nav>
  );
}