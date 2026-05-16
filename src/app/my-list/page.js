'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function MyListPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    // загрузка из localStorage
    useEffect(() => {
        queueMicrotask(() => {
            const saved = localStorage.getItem("myList");
            if (saved) setList(JSON.parse(saved));
            setLoading(false);
        });
    }, []);

    const removeMovie = (id) => {
        setList(prev => {
            const updated = prev.filter(m => m.id !== id);
            localStorage.setItem("myList", JSON.stringify(updated));
            return updated;
        });
    };

    if (loading) {
        return (
            <main className="app moviesPage">
                <Navbar />
                <div className="emptyState">Loading...</div>
            </main>
        );
    }

    return (
        <main className="app moviesPage">

            <Navbar />

            <div className="myListHero">
                <h1 className="moviesPageTitle">⭐ My List</h1>
                <p className="moviesPageSubtitle">
                    Your saved movies collection
                </p>
            </div>

            {list.length === 0 ? (
                <div className="emptyState">
                    <div className="emptyIcon">🎬</div>
                    <h2>No movies in your list</h2>
                    <p>Start adding movies you like and they will appear here</p>
                </div>
            ) : (
                <div className="myListContainer">
                    <div className="trendingGrid">

                        {list.map(movie => (
                            <div key={movie.id} className="myCard">

                                <Link href={`/movie/${movie.id}`} className="myCardLink">
                                    <Image
                                        className="myCardImg"
                                        src={
                                            movie.poster_path
                                                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                                : "/no-image.png"
                                        }
                                        alt={movie.title}
                                        width={300}
                                        height={450}
                                    />

                                    <div className="myCardOverlay">
                                        <p>{movie.title}</p>
                                    </div>
                                </Link>

                                <button
                                    className="myCardRemove"
                                    onClick={() => removeMovie(movie.id)}
                                >
                                    ✕
                                </button>

                            </div>
                        ))}

                    </div>
                </div>
            )}
        </main>
    );
}