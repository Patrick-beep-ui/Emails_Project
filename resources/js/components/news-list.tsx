// components/MyNews.tsx
"use client"

import { FC, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewsFilters } from "@/components/news-filters"
import { NewsArticleCard } from "@/components/news-article-card"

import { getUserNews } from "@/services/newsServices"
import { Tag } from "./tags-list"

import { ArrowUpIcon } from "lucide-react"

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
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getUserNews(user.user_id, currentPage)
        setNewsData(response.data.news.data);
        setLastPage(response.data.news.last_page);
      } catch (e) {
        console.error("Failed to fetch news:", e)
      }
    }

    fetchNews()
  }, [user.user_id, currentPage])

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

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

            {/* Pagination Buttons */}
            <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>

        {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          size="sm"
          disabled={currentPage === lastPage}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
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

        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 cursor-pointer"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        )}

      </div>

    </div>
  )
}
