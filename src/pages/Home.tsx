"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/Navigation"
import HeroSection from "@/components/HeroSection"
import AnimeRow from "@/components/AnimeRow"
import ContinueWatching from "@/components/ContinueWatching"
import GenreFilter from "@/components/GenreFilter"
import { supabase } from "@/integrations/supabase/client"

interface Anime {
  id: string
  title: string
  image: string
  release_year?: number
  rating?: number
}

const Home = () => {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnime = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(
          "id, title, thumbnail_url, thumbnail_file_path, thumbnail_file_name, release_year, rating, status, description, synopsis, episode_count, studio_name, created_at, updated_at",
        )
        .eq("is_archived", false)
        .order("rating", { ascending: false })
        .limit(100)

      if (fetchError) {
        console.error("[v0] Supabase fetch error:", fetchError)
        setError(fetchError.message)
      } else if (data) {
        console.log("[v0] Fetched anime data:", data.length, "items")
        const mappedData = data.map((anime: any) => ({
          ...anime,
          image: anime.thumbnail_url || "/placeholder.svg",
        }))
        setAllAnime(mappedData as Anime[])
      }
    } catch (err) {
      console.error("[v0] Fetch exception:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAnime()
  }, [])

  const filterByGenre = (animes: Anime[]) => {
    if (selectedGenre === "All") return animes
    return animes
  }

  const popularAnime = filterByGenre(allAnime.slice(0, 6))
  const trendingAnime = filterByGenre(allAnime.slice(6, 12))
  const topRatedAnime = filterByGenre(allAnime.slice(12, 18))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />

      <div className="space-y-8 md:space-y-12 pb-12 md:pb-20 relative z-10">
        {error && (
          <div className="px-4 md:px-8 py-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 flex justify-between items-center">
            <span>Error loading anime: {error}</span>
            <button onClick={() => fetchAnime()} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm">
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="px-4 md:px-8 text-muted-foreground flex justify-between items-center">
            <span>Loading anime data...</span>
            <button
              onClick={() => fetchAnime()}
              className="px-3 py-1 bg-primary hover:bg-primary/80 rounded text-sm text-primary-foreground"
            >
              Refresh
            </button>
          </div>
        )}

        <ContinueWatching />

        <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />

        {!loading && !error && popularAnime.length > 0 && <AnimeRow title="Top Rated" animes={popularAnime} />}

        {!loading && !error && trendingAnime.length > 0 && (
          <AnimeRow
            title="Popular Anime"
            animes={trendingAnime.map((a) => ({
              ...a,
              badge: "Popular",
            }))}
          />
        )}

        {!loading && !error && topRatedAnime.length > 0 && <AnimeRow title="More Anime" animes={topRatedAnime} />}

        {!loading && !error && allAnime.length === 0 && (
          <div className="px-4 md:px-8 text-muted-foreground text-center py-12">
            No anime found in database. Please add anime data to Supabase.
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
