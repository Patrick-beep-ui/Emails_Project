"use client"

import { useState, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchIcon, PlusIcon, XIcon } from "lucide-react"
import { Tag, Keyword } from "./tags-list"
import { requestSubscription } from "@/services/tagServices"
import { User } from "@/contexts/auth-context"

interface TagDetailsModalProps {
    tag: Tag | null
    user: User | null
    isOpen: boolean
    onClose: () => void
    onToggleSubscription: (tagId: string, state?: "pending" | "subscribed") => void
  }

export function TagDetailsModal({ tag, isOpen, onClose, onToggleSubscription, user }: TagDetailsModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false);

  const handleRemoveKeyword = (keyword: string) => {
    // In a real app, this would make an API call
    console.log("Removing keyword:", keyword)
  }

  const handleRequestSubscription = useCallback(async () => {
    try {
      if (!user || !tag) {
        console.error("User or tag not available");
        return;
      }

      setLoading(true)

      if (tag.subscribed) {
        console.log("Unsubscribe flow not implemented yet for tag:", tag.tag_id)
        // await unsubscribeFromTag({ user_id: user.user_id, tag_id: tag.tag_id })
        return
      }
  
      
      const response = await requestSubscription({
        user_id: user.user_id,
        tag_id: tag.tag_id
      });
  
      console.log("Subscription request response:", response.data);
      onToggleSubscription(tag.tag_id, "pending");
      tag.pending = true; // Update local state to reflect pending status
      onClose()
  
    } catch (e) {
      console.error("Subscription request failed:", e);
    } finally {
      setLoading(false)
    }
  }, [tag, user, onToggleSubscription]);

  const keywords: Keyword[] = useMemo(() => {
    return tag?.keywords || []
  }, [tag])

  const filteredKeywords = useMemo(() => {
    return keywords.filter((keyword) =>
      keyword.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [keywords, searchTerm])

  
  if (!tag) return null
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">{tag.name}</DialogTitle>
          <DialogDescription>Manage keywords and subscription settings for this category</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-6">
          {/* Subscription Toggle */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Subscription Status</CardTitle>
                  <CardDescription className="text-sm">
                    {tag.subscribed ? "You're receiving news for this category" : "Subscribe to receive news updates"}
                  </CardDescription>
                </div>
                <Button
                  variant={tag.subscribed ? "destructive" : "default"}
                  onClick={() => handleRequestSubscription()}
                  className="shrink-0"
                  disabled={tag.pending || loading}
                >
                  {loading ? "Processing..." : tag.pending ? "Pending" : tag.subscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Keywords Section */}
          <Card className="border-border/50 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Keywords ({filteredKeywords.length})</CardTitle>
              <CardDescription className="text-sm">
                These keywords are used to find relevant news articles for this category
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border/50"
                />
              </div>

              {/* Add New Keyword 
              <div className="flex gap-2">
                <Input
                  placeholder="Add new keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                  className="bg-input border-border/50"
                />
                <Button onClick={handleAddKeyword} size="sm" className="shrink-0">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
                */}
                
              {/* Keywords List */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                {filteredKeywords.map((keyword) => (
                    <Badge
                        key={keyword.id}
                        variant="secondary"
                        className="text-sm py-1 px-3 flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                    >
                        {keyword.content}
                        <button
                        onClick={() => handleRemoveKeyword(keyword.content)}
                        className="hover:text-destructive transition-colors"
                        >
                        <XIcon className="h-3 w-3" />
                        </button>
                    </Badge>
                    ))}

                </div>

                {filteredKeywords.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No keywords found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
