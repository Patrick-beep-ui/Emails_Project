"use client"
import { useState, useCallback, useEffect, useMemo, memo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TagsIcon, NewspaperIcon, KeyIcon, LogOutIcon, UserIcon, SettingsIcon } from "lucide-react"

import { TagDetailsModal } from "@/components/modals/tag-details-modal"
import { EmailPreferencesModal } from "@/components/modals/emails-preferences-modal"

import TagList  from "@/components/tags-list"
import { MyNews } from "@/components/news-list"

import Users from "./Users"

import { SubscribedTagsCard } from "@/components/SubscribedTags"
import { getUserStats } from "@/services/usersService"

import type { Tag } from "@/components/tags-list"


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
  }
]

interface Stats {
  activeSubscriptions: number;
  availableTags: number;
  keywordsTracked: number;
  newsThisWeek: number;
}

function Dashboard() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState("overview")
  const [tags, setTags] = useState(mockTags)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [stats, setStats] = useState<Stats>({
    activeSubscriptions: 0,
    availableTags: 0,
    keywordsTracked: 0,
    newsThisWeek: 0,
  });
  const [isEmailPreferencesOpen, setIsEmailPreferencesOpen] = useState(false)
  

  // News filtering state
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

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
  }, [user])

  
  const toggleSubscription = useCallback((tagId: string) => {
    setTags(tags.map((tag) => (tag.id === tagId ? { ...tag, subscribed: !tag.subscribed } : tag)))
  }, [tags]);

  const openTagDetails = useCallback((tag: Tag) => {
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

  const filteredArticles = useMemo(() => {
    return mockArticles.filter((article) => {
      const matchesSearch =
        searchTerm === "" ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTags =
        selectedTagFilters.length === 0 || selectedTagFilters.some((tag) => article.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [searchTerm, selectedTagFilters])

  const handleBookmark = useCallback((articleId: string) => {
    console.log("Bookmarking article:", articleId)
    // In a real app, this would make an API call
  }, [])

  const handleShare = useCallback((article: (typeof mockArticles)[0]) => {
    console.log("Sharing article:", article.title)
  }, [])


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-light tracking-wide text-primary">News Emailer</h1>
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
                {/* Admin view - only show if user is admin */}
                {user?.role == 'admin' && (
                <button
                  onClick={() => setActiveView("users")}
                  className={`text-sm transition-colors ${
                    activeView === "users" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Users
                </button>
                )}
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
                onClick={() => setIsEmailPreferencesOpen(true)}
                className="text-muted-foreground hover:text-foreground"
                title="Email Preferences"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>

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
                  <div className="text-2xl font-light">{stats.newsThisWeek}</div>
                  <p className="text-xs text-muted-foreground">Weekly summary</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscribed Tags */}
            <SubscribedTagsCard 
              openTagDetails={openTagDetails} 
              user={user}
            />

          </div>
        )}

        {user && activeView === "tags" && (
          <TagList
            toggleSubscription={toggleSubscription}
            user={user}
          />
        )}


          {user && activeView === "news" && (
            <MyNews
            user={user}
              selectedTagFilters={selectedTagFilters}
              searchTerm={searchTerm}
              onTagToggle={toggleTagFilter}
              onSearchChange={setSearchTerm}
              onClearFilters={clearFilters}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          )}

        
        {activeView === "users" && (
          <Users />
        )}
      </main>

      <TagDetailsModal
      user={user}
        tag={selectedTag}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onToggleSubscription={toggleSubscription}
      />


      <EmailPreferencesModal 
      isOpen={isEmailPreferencesOpen} 
      onClose={() => setIsEmailPreferencesOpen(false)}
      user={user} />

    </div>
  )
}

export default memo(Dashboard)