"use client"

import { FC, useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewsFilters } from "@/components/news-filters"
import { NewsArticleCard } from "@/components/news-article-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { getUserNews, saveNews, unsaveNews, getSavedNews } from "@/services/newsServices"
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

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

const years = [2025, 2024, 2023, 2022]

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
  const [savedArticles, setSavedArticles] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getUserNews(
          user.user_id,
          currentPage,
          selectedMonth || undefined,
          selectedYear || undefined
        )
        setNewsData(response.data.news.data)
        setLastPage(response.data.news.last_page)
      } catch (e) {
        console.error("Failed to fetch news:", e)
      }
    }

    fetchNews()
  }, [user.user_id, currentPage, selectedMonth, selectedYear])

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // load saved news when user loads
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await getSavedNews(user.user_id)
        const savedIds = response.data.saved_news.data.map((n: any) => n.new_id.toString())
        setSavedArticles(savedIds)
      } catch (e) {
        console.error("Failed to fetch saved news", e)
      }
    }
    fetchSaved()
  }, [user.user_id])

  const articles: Article[] = newsData
    .map((newsItem) => ({
      id: newsItem.news_id.toString(),
      title: newsItem.news_title,
      snippet: newsItem.news_description,
      source: newsItem.news_domain,
      date: newsItem.news_date.split(" ")[0],
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

  const allTags = useMemo(() => {
    return Array.from(new Set(newsData.flatMap((n) => [n.news_category])))
  }, [newsData])

  const handleShare = useCallback((article: Article) => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.snippet,
          url: article.url,
        })
        .then(() => console.log("Shared successfully"))
        .catch((err) => console.error("Error sharing:", err))
    } else {
      navigator.clipboard.writeText(article.url)
      alert("Link copied to clipboard!")
    }
  }, [])

  const handleBookmark = useCallback(async (articleId: string, currentlySaved: boolean) => {
    try {
      if (currentlySaved) {
        await unsaveNews(user.user_id, parseInt(articleId))
        setSavedArticles(savedArticles.filter((id) => id !== articleId))
      } else {
        await saveNews(user.user_id, parseInt(articleId))
        setSavedArticles([...savedArticles, articleId])
      }
    } catch (e) {
      console.error("Error saving/unsaving news:", e)
    }
  }, [user.user_id]);
  

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-2">My News</h2>
        <p className="text-muted-foreground">
          Recent articles delivered to your inbox
          {newsData.length !== 0 && ` (${newsData.length} news)`}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select onValueChange={(value) => setSelectedMonth(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSelectedMonth(null)
            setSelectedYear(null)
            setCurrentPage(1)
          }}
        >
          Clear
        </Button>
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

      {(() => {
        const visiblePages: (number | string)[] = []
        const total = lastPage

        if (total <= 7) {
          // Show all pages if few
          for (let i = 1; i <= total; i++) visiblePages.push(i)
        } else {
          // Always show first and last
          const start = Math.max(2, currentPage - 2)
          const end = Math.min(total - 1, currentPage + 2)

          visiblePages.push(1)
          if (start > 2) visiblePages.push("...")

          for (let i = start; i <= end; i++) visiblePages.push(i)

          if (end < total - 1) visiblePages.push("...")
          visiblePages.push(total)
        }

        return visiblePages.map((page, idx) =>
          typeof page === "number" ? (
            <Button
              key={idx}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ) : (
            <span key={idx} className="text-muted-foreground px-2">
              {page}
            </span>
          )
        )
      })()}

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
        availableTags={allTags}
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
              article={{ ...article, isSaved: savedArticles.includes(article.id) }}
              onBookmark={handleBookmark}
              onShare={handleShare}
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
