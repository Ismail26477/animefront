"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string | null
  }
}

interface CommentsProps {
  animeId: string
}

const Comments = ({ animeId }: CommentsProps) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [animeId])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username
        )
      `)
      .eq("anime_id", animeId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setComments(data as any)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setLoading(true)
    try {
      console.log("[v0] Attempting to post comment for user:", user.id)
      console.log("[v0] Anime ID:", animeId)

      const { data, error } = await supabase
        .from("comments")
        .insert({
          anime_id: animeId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select()

      if (error) {
        console.log("[v0] Comment insert error:", error)
        toast({
          title: "Error",
          description: `Failed to post comment: ${error.message}`,
          variant: "destructive",
        })
      } else {
        console.log("[v0] Comment posted successfully:", data)
        setNewComment("")
        fetchComments()
        toast({
          title: "Success",
          description: "Comment posted!",
        })
      }
    } catch (err) {
      console.log("[v0] Exception in handleSubmit:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (!error) {
      fetchComments()
      toast({
        title: "Success",
        description: "Comment deleted",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl md:text-2xl font-bold">Comments</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={loading || !newComment.trim()}>
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground">Sign in to leave a comment</p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{comment.profiles?.username || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {user?.id === comment.user_id && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(comment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Comments
