// components/MyNews.tsx
"use client"

import { FC, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewsFilters } from "@/components/news-filters"
import { NewsArticleCard } from "@/components/news-article-card"

import { getUserNews } from "@/services/newsServices"
import { Tag } from "./tags-list"

interface News {
  news_id: number
  news_title: string
  news_description: string
  news_url: string
  news_date: string
  news_domain: string
  news_category: string
}

interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  tags: Tag
}

interface Article {
  id: string
  title: string
  snippet: string
  source: string
  date: string
  tags: string[]
  url: string
  imageUrl?: string
}

interface MyNewsProps {
  user: User
  selectedTagFilters: string[]
  searchTerm: string
  onTagToggle: (tag: string) => void
  onSearchChange: (value: string) => void
  onClearFilters: () => void
  onBookmark: (articleId: string) => void
  onShare: (article: Article) => void
}

export const MyNews: FC<MyNewsProps> = ({
  user,
  selectedTagFilters,
  searchTerm,
  onTagToggle,
  onSearchChange,
  onClearFilters,
  onBookmark,
  onShare
}) => {
  const [newsData, setNewsData] = useState<News[]>([])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getUserNews(user.user_id)
        setNewsData(response.data.news)
        console.log("Fetched news:", response.data.news)
      } catch (e) {
        console.error("Failed to fetch news:", e)
      }
    }

    fetchNews()
  }, [user.user_id])

  const articles: Article[] = newsData
    .map((newsItem) => ({
      id: newsItem.news_id.toString(),
      title: newsItem.news_title,
      snippet: newsItem.news_description,
      source: newsItem.news_domain,
      date: newsItem.news_date.split(" ")[0], // only YYYY-MM-DD
      tags: [newsItem.news_category],
      url: newsItem.news_url,
    }))
    .filter((article) => {
      const matchesSearch =
        searchTerm === "" ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesTags =
        selectedTagFilters.length === 0 ||
        selectedTagFilters.some((tag) => article.tags.includes(tag))

      return matchesSearch && matchesTags
    })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-2">My News</h2>
        <p className="text-muted-foreground">
          Recent articles delivered to your inbox
          {newsData.length !== 0 && ` (${newsData.length} news)`}
        </p>
      </div>

      {/* Filters */}
      <NewsFilters
        selectedTags={selectedTagFilters}
        onTagToggle={onTagToggle}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onClearFilters={onClearFilters}
      />

      {/* Articles */}
      <div className="space-y-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <NewsArticleCard
              key={article.id}
              article={article}
              onBookmark={onBookmark}
              onShare={onShare}
            />
          ))
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No articles found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to see more articles.
                </p>
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="mt-4 bg-transparent"
                >
                  Clear all filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
