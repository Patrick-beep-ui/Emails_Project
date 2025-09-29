"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { TagDetailsModal } from "@/components/tag-details-modal"
import { NewsFilters } from "@/components/news-filters"
import { NewsArticleCard } from "@/components/news-article-card"
import { TagsIcon, NewspaperIcon, KeyIcon, LogOutIcon, UserIcon, SettingsIcon } from "lucide-react"


import { TagList } from "@/components/tags-list"
import { SubscribedTagsCard } from "@/components/SubscribedTags"
import { getUserStats } from "@/services/usersService"

// Mock data
const mockTags = [
  { id: "1", name: "Technology", subscribed: true, keywordCount: 12 },
  { id: "2", name: "Business", subscribed: true, keywordCount: 8 },
  { id: "3", name: "Science", subscribed: false, keywordCount: 15 },
  { id: "4", name: "Sports", subscribed: true, keywordCount: 6 },
  { id: "5", name: "Politics", subscribed: false, keywordCount: 10 },
]

const mockArticles = [
  {
    id: "1",
    title: "OpenAI Announces GPT-5 with Revolutionary Capabilities",
    snippet:
      "The latest iteration of GPT promises unprecedented performance in reasoning and multimodal understanding, setting new benchmarks across various AI evaluation metrics. The model demonstrates significant improvements in code generation, mathematical reasoning, and creative writing tasks.",
    source: "TechCrunch",
    date: "2 hours ago",
    tags: ["Technology"],
    url: "https://techcrunch.com/gpt-5-announcement",
    readTime: "4 min read",
    imageUrl: "/ai-technology-announcement.jpg",
  },
  {
    id: "2",
    title: "Tesla Stock Surges After Q4 Earnings Beat Expectations",
    snippet:
      "Electric vehicle manufacturer reports record deliveries and improved profit margins in latest quarter, driven by strong demand for Model Y and successful cost reduction initiatives. The company also announced plans for new manufacturing facilities.",
    source: "Reuters",
    date: "4 hours ago",
    tags: ["Business", "Technology"],
    url: "https://reuters.com/tesla-earnings-q4",
    readTime: "3 min read",
    imageUrl: "/tesla-stock-market-chart.jpg",
  },
  {
    id: "3",
    title: "NASA's James Webb Telescope Discovers Earth-Like Exoplanet",
    snippet:
      "Astronomers identify potentially habitable world just 22 light-years away with atmospheric conditions similar to Earth. The planet, designated K2-18b, shows signs of water vapor and possible cloud formations in its atmosphere.",
    source: "Nature",
    date: "6 hours ago",
    tags: ["Science"],
    url: "https://nature.com/webb-exoplanet-discovery",
    readTime: "5 min read",
    imageUrl: "/james-webb-telescope-space-discovery.jpg",
  },
  {
    id: "4",
    title: "Federal Reserve Signals Potential Interest Rate Cuts",
    snippet:
      "Central bank officials hint at monetary policy adjustments in response to cooling inflation data and economic indicators. Markets react positively to the prospect of lower borrowing costs.",
    source: "Wall Street Journal",
    date: "8 hours ago",
    tags: ["Business"],
    url: "https://wsj.com/fed-interest-rates",
    readTime: "6 min read",
  },
  {
    id: "5",
    title: "Breakthrough in Quantum Computing Achieved by MIT Researchers",
    snippet:
      "Scientists demonstrate new quantum error correction method that could make quantum computers more practical for real-world applications. The technique reduces error rates by 90% compared to previous methods.",
    source: "MIT Technology Review",
    date: "12 hours ago",
    tags: ["Technology", "Science"],
    url: "https://technologyreview.com/quantum-breakthrough",
    readTime: "7 min read",
    imageUrl: "/quantum-computing-laboratory.png",
  },
  {
    id: "6",
    title: "Climate Summit Reaches Historic Agreement on Carbon Reduction",
    snippet:
      "World leaders commit to ambitious new targets for greenhouse gas emissions, with binding agreements for major economies. The deal includes significant funding for developing nations' clean energy transitions.",
    source: "BBC News",
    date: "1 day ago",
    tags: ["Science", "Politics"],
    url: "https://bbc.com/climate-summit-agreement",
    readTime: "8 min read",
  },
]

interface Stats {
  activeSubscriptions: number;
  availableTags: number;
  keywordsTracked: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState("overview")
  const [tags, setTags] = useState(mockTags)
  const [selectedTag, setSelectedTag] = useState<(typeof mockTags)[0] | null>(null)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [stats, setStats] = useState<Stats>({
    activeSubscriptions: 0,
    availableTags: 0,
    keywordsTracked: 0,
  });
  

  // News filtering state
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  console.log("User data:", user)

  const toggleSubscription = useCallback((tagId: string) => {
    setTags(tags.map((tag) => (tag.id === tagId ? { ...tag, subscribed: !tag.subscribed } : tag)))
  }, [tags])

  const openTagDetails = useCallback((tag: (typeof mockTags)[0]) => {
    setSelectedTag(tag)
    setIsTagModalOpen(true)
  },[selectedTag, isTagModalOpen])

  // News filtering functions
  const toggleTagFilter = useCallback((tag: string) => {
    setSelectedTagFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [selectedTagFilters])

  const clearFilters = useCallback(() => {
    setSelectedTagFilters([])
    setSearchTerm("")
  }, [selectedTagFilters, searchTerm])

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch =
      searchTerm === "" ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.source.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTagFilters.length === 0 || selectedTagFilters.some((tag) => article.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const handleBookmark = useCallback((articleId: string) => {
    console.log("Bookmarking article:", articleId)
    // In a real app, this would make an API call
  }, [])

  const handleShare = (article: (typeof mockArticles)[0]) => {
    console.log("Sharing article:", article.title)
    // In a real app, this would open a share dialog
  }

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await getUserStats(user?.user_id);
        setStats(response.data.stats);
      }
      catch(e) {
        console.error("Failed to fetch user stats:", e)
      }
    }

    getUserData();
  }, [])


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-light tracking-wide text-primary">newsflow.</h1>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveView("overview")}
                  className={`text-sm transition-colors ${
                    activeView === "overview" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveView("tags")}
                  className={`text-sm transition-colors ${
                    activeView === "tags" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tags
                </button>
                <button
                  onClick={() => setActiveView("news")}
                  className={`text-sm transition-colors ${
                    activeView === "news" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My News
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "overview" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light text-balance">Welcome back, {`${user?.first_name}`}</h2>
              <p className="text-muted-foreground">You're subscribed to {stats.activeSubscriptions} news categories</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <TagsIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light">{stats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">of {stats.availableTags} available tags</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Keywords Tracked</CardTitle>
                  <KeyIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light">
                    {stats.keywordsTracked}
                  </div>
                  <p className="text-xs text-muted-foreground">across all subscriptions</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Articles This Week</CardTitle>
                  <NewspaperIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light">24</div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscribed Tags */}
            <SubscribedTagsCard 
              toggleSubscription={toggleSubscription} 
              openTagDetails={openTagDetails} 
              user={user}
            />

          </div>
        )}

        {activeView === "tags" && (
          <TagList
            toggleSubscription={toggleSubscription}
          />
        )}


        {activeView === "news" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light mb-2">My News</h2>
              <p className="text-muted-foreground">
                Recent articles delivered to your inbox
                {filteredArticles.length !== mockArticles.length &&
                  ` (${filteredArticles.length} of ${mockArticles.length} articles)`}
              </p>
            </div>

            {/* Filters */}
            <NewsFilters
              selectedTags={selectedTagFilters}
              onTagToggle={toggleTagFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearFilters={clearFilters}
            />

            {/* Articles */}
            <div className="space-y-6">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <NewsArticleCard
                    key={article.id}
                    article={article}
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
                      <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
                        Clear all filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      <TagDetailsModal
        tag={selectedTag}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onToggleSubscription={toggleSubscription}
      />
    </div>
  )
}
