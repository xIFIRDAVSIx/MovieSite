'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <nav className="bottomNav">

      <Link href="/" className={isActive("/") ? "active" : ""}>
        🏠
        <span>Home</span>
      </Link>

      <Link href="/movies" className={isActive("/movies") ? "active" : ""}>
        🎬
        <span>Movies</span>
      </Link>

      <Link href="/trending" className={isActive("/trending") ? "active" : ""}>
        🔥
        <span>Trending</span>
      </Link>

      <Link href="/my-list" className={isActive("/my-list") ? "active" : ""}>
        ⭐
        <span>My List</span>
      </Link>

    </nav>
  );
}