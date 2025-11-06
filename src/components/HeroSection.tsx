"use client"

import { useState, useEffect } from "react"
import { Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

interface HeroAnime {
  id: string
  title: string
  description?: string
  synopsis?: string
  thumbnail_url?: string
  thumbnail_file_path?: string
  thumbnail_file_name?: string
  rating?: number
  release_year?: number
  status?: string
}

const HeroSection = () => {
  const [heroAnime, setHeroAnime] = useState<HeroAnime[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeroAnime = async () => {
      try {
        const { data, error } = await supabase
          .from("anime")
          .select(
            "id, title, description, synopsis, thumbnail_url, thumbnail_file_path, thumbnail_file_name, rating, release_year, status",
          )
          .eq("is_archived", false)
          .order("rating", { ascending: false })
          .limit(6)

        if (!error && data) {
          setHeroAnime(data as HeroAnime[])
        }
      } catch (err) {
        console.error("[v0] Error fetching hero anime:", err)
        // Fallback to empty state
        setHeroAnime([])
      } finally {
        setLoading(false)
      }
    }

    fetchHeroAnime()
  }, [])

  useEffect(() => {
    if (heroAnime.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroAnime.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [heroAnime])

  if (loading || heroAnime.length === 0) {
    return (
      <div className="relative h-[50vh] md:h-[85vh] w-full overflow-hidden bg-gradient-to-b from-background/50 to-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading featured anime...</p>
      </div>
    )
  }

  const current = heroAnime[currentIndex]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroAnime.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroAnime.length) % heroAnime.length)
  }

  return (
    <div className="relative h-[50vh] md:h-[85vh] w-full overflow-hidden">
      {heroAnime.map((anime, index) => (
        <div
          key={anime.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${anime.thumbnail_url || "/placeholder.svg"})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
          </div>
        </div>
      ))}

      <div className="relative h-full flex items-end pb-16 md:pb-24 px-4 md:px-8">
        <div className="max-w-2xl space-y-4 md:space-y-6 animate-fade-in">
          <h1 className="text-3xl md:text-6xl font-bold leading-tight">{current.title}</h1>

          <div className="flex items-center gap-3 text-sm md:text-base">
            {current.rating && <span className="text-primary font-semibold">{current.rating}% match</span>}
            <span className="px-2 py-0.5 border border-muted-foreground/50 text-xs">HD</span>
          </div>

          <p className="text-sm md:text-base text-foreground/90 line-clamp-3 md:line-clamp-none">
            {current.description || current.synopsis || "An amazing anime series"}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to={`/anime/${current.id}`}>
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 gap-2 text-sm md:text-base px-4 md:px-8"
              >
                <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                Play
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-background/20 backdrop-blur-sm border-foreground/20 hover:bg-background/30 text-sm md:text-base px-4 md:px-6"
            >
              <Info className="h-4 w-4 md:h-5 md:w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {heroAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-primary" : "w-1 bg-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroSection
