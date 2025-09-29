"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon, BookmarkIcon, ShareIcon } from "lucide-react"

interface NewsArticle {
  id: string
  title: string
  snippet: string
  source: string
  date: string
  tags: string[]
  url?: string
  imageUrl?: string
  readTime?: string
}

interface NewsArticleCardProps {
  article: NewsArticle
  onBookmark?: (articleId: string) => void
  onShare?: (article: NewsArticle) => void
}

export function NewsArticleCard({ article, onBookmark, onShare }: NewsArticleCardProps) {
  return (
    <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with image if available */}
          {article.imageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={article.imageUrl || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-medium text-balance leading-tight hover:text-primary transition-colors cursor-pointer">
                {article.title}
              </h3>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{article.date}</div>
            </div>

            <p className="text-muted-foreground text-pretty leading-relaxed line-clamp-3">{article.snippet}</p>

            {/* Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">{article.source}</span>
                {article.readTime && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{article.readTime}</span>
                  </>
                )}
              </div>
              <div className="flex gap-1">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onBookmark?.(article.id)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <BookmarkIcon className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare?.(article)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <ShareIcon className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80" asChild>
                <a href={article.url || "#"} target="_blank" rel="noopener noreferrer">
                  Read full article
                  <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
