'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCallback } from "react";
import Image from "next/image";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// =========================
// SKELETON (OUTSIDE COMPONENT)
// =========================
function MovieSkeleton() {
    return (
        <div className="skeletonPage">
            <div className="skeletonPoster"></div>
            <div className="skeletonInfo">
                <div className="skLine w60"></div>
                <div className="skLine w40"></div>
                <div className="skLine w90"></div>
                <div className="skLine w80"></div>
            </div>
        </div>
    );
}

export default function MoviePage() {
    const params = useParams();
    const id = params?.id;

    const [movie, setMovie] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openTrailer, setOpenTrailer] = useState(false);

    const [similar, setSimilar] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [toast, setToast] = useState(false);
    const [movieLoading, setMovieLoading] = useState(true);

    const loaderRef = useRef(null);
    const loadingMoreRef = useRef(false);


    // =========================
    // MOVIE FETCH
    // =========================
    const fetchMovie = useCallback(async () => {
        try {
            setLoading(true);

            const [movieRes, videoRes] = await Promise.all([
                axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`),
                axios.get(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`)
            ]);

            setMovie(movieRes.data);

            const trailerVideo = videoRes.data.results.find(
                (v) => v.site === "YouTube" && v.type === "Trailer"
            );

            setTrailer(trailerVideo?.key || null);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // =========================
    // SIMILAR FETCH
    // =========================


    const fetchSimilar = useCallback(async (pageNum) => {
        try {
            const res = await axios.get(
                `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&page=${pageNum}`
            );

            setSimilar((prev) => {
                const ids = new Set(prev.map(m => m.id));
                const filtered = res.data.results.filter(m => !ids.has(m.id));
                return [...prev, ...filtered];
            });

            if (pageNum >= res.data.total_pages) {
                setHasMore(false);
            }

        } catch (err) {
            console.log(err);
        }
    }, [id]);

    // =========================
    // ADD TO LIST
    // =========================
    const addToList = () => {
        const saved = JSON.parse(localStorage.getItem("myList")) || [];

        if (saved.some(m => m.id === movie.id)) return;

        localStorage.setItem("myList", JSON.stringify([...saved, movie]));

        setToast(true);
        setTimeout(() => setToast(false), 2000);
    };

    // =========================
    // INIT
    // =========================
    useEffect(() => {
        if (!id) return;

        const resetAndLoad = async () => {
            setSimilar([]);
            setPage(1);
            setHasMore(true);

            await fetchMovie();
            await fetchSimilar(1);
        };

        resetAndLoad();
    }, [fetchMovie, fetchSimilar, id]);


    // =========================
    // INFINITE SCROLL (FIXED)
    // =========================
    useEffect(() => {
        const el = loaderRef.current;
        if (!el || !hasMore) return;

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];

            if (
                entry.isIntersecting &&
                hasMore &&
                !loading &&
                !loadingMoreRef.current
            ) {
                loadingMoreRef.current = true;

                setPage(prev => prev + 1);
            }
        });

        observer.observe(el);

        return () => observer.disconnect();
    }, [hasMore, loading]);


    useEffect(() => {
        if (page === 1) return;

        const load = async () => {
            await fetchSimilar(page);
            loadingMoreRef.current = false;
        };

        load();
    }, [page, fetchSimilar]);

    // =========================
    // UI
    // =========================
    if (loading) return <MovieSkeleton />;
    if (!movie) return <h1>Movie not found</h1>;

    return (
        <main className="moviePage">

            <button className="backBtn" onClick={() => window.history.back()}>
                ← Back
            </button>

            <div
                className="movieBackdrop"
                style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                }}
            />

            <div className="movieBackdropOverlay" />

            <motion.div
                className="movieDetails"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="posterWrapper">
                    <Image
                        src={
                            movie?.poster_path
                                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                : "/no-image.png"
                        }
                        alt={movie?.title || "movie"}
                        fill
                        sizes="(max-width: 768px) 50vw, 300px"
                        style={{ objectFit: "cover" }}
                    />
                </div>

                <div className="movieInfoBlock">
                    <h1>{movie.title}</h1>
                    <p className="ratingGlow">★ {movie.vote_average?.toFixed(1)}</p>
                    <p>{movie.overview}</p>

                    {trailer && (
                        <button className="trailerBtn" onClick={() => setOpenTrailer(true)}>
                            ▶ Watch Trailer
                        </button>
                    )}

                    <button className="btnSecondary" onClick={addToList}>
                        + Save
                    </button>
                </div>
            </motion.div>

            {/* MODAL */}
            <AnimatePresence>
                {openTrailer && (
                    <motion.div
                        className="modalOverlay"
                        onClick={() => setOpenTrailer(false)}
                    >
                        <motion.div onClick={(e) => e.stopPropagation()}>
                            <iframe
                                src={`https://www.youtube.com/embed/${trailer}`}
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIMILAR */}
            <div className="similarSection">
                <h2>Рекомендуем</h2>

                <div className="similarGrid">
                    {similar.map((m) => (
                        <Link key={m.id} href={`/movie/${m.id}`}>
                            <div className="similarPoster">
                                <Image
                                    src={
                                        m.poster_path
                                            ? `https://image.tmdb.org/t/p/w300${m.poster_path}`
                                            : "/no-image.png"
                                    }
                                    alt={m.title}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    sizes="150px"
                                />
                            </div>
                        </Link>
                    ))}
                </div>

                <div ref={loaderRef}>
                    {hasMore ? "Loading..." : "End"}
                </div>
            </div>

            {toast && <div className="toast">Added</div>}
        </main>
    );
}