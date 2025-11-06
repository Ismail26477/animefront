"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"

interface Anime {
  id: string
  title: string
  description: string
  thumbnail_url?: string
}

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchAnime = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("anime")
          .select("id, title, description, thumbnail_url")
          .ilike("title", `%${query}%`)
          .eq("is_archived", false)
          .limit(10)

        if (error) {
          console.error("[v0] Search error:", error)
          return
        }

        setResults(data || [])
      } catch (err) {
        console.error("[v0] Search exception:", err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchAnime, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4 bg-background rounded-lg shadow-lg">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Search anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && <div className="p-8 text-center text-muted-foreground">Searching...</div>}

          {!loading && results.length === 0 && query && (
            <div className="p-8 text-center text-muted-foreground">No anime found</div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {results.map((anime) => (
                <button
                  key={anime.id}
                  onClick={() => {
                    navigate(`/anime/${anime.id}`)
                    onClose()
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                >
                  {anime.thumbnail_url && (
                    <img
                      src={anime.thumbnail_url || "/placeholder.svg"}
                      alt={anime.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium text-foreground">{anime.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{anime.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
