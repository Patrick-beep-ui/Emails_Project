"use client"

import { FC, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsIcon, Tag, Loader2 } from "lucide-react"
import { TagDetailsModal } from "./tag-details-modal"
import { User } from "@/contexts/auth-context"


import { useState, useEffect, useCallback, useRef } from "react"
import { getTagsInfo } from "@/services/tagServices"

export interface Keyword {
    id: string
    content: string
  }

  export interface Pivot {
    user_id: string
    tag_id: string
    is_active: boolean
    is_pending: boolean
  }
  
  export interface Tag {
    tag_id: string
    name: string
    description: string
    subscribed: boolean
    pending: boolean
    keywords_count?: number
    keywords?: Keyword[]
    pivot: Pivot
  }

  export interface UserWithTags extends User {
    tags: Tag[]
  }
  
  const tagCache = new Map<string, Tag[]>()

  interface TagListProps {
    toggleSubscription: (id: string, state?: "pending" | "subscribed") => void;
    user: UserWithTags;
  }

const TagList: FC<TagListProps> = ({ toggleSubscription, user, }) => {
    const dataCache = useRef<Tag[] | null>(null);
    const [tagList, setTagList] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false); // mounted flag

      const openTagDetails = useCallback((tag: Tag) => {
        setSelectedTag(tag)
        setIsTagModalOpen(true)
      },[])

    useEffect(() => {
      if (!user) return;

      /*
        if (tagCache.has(user.user_id)) {
          setTagList(tagCache.get(user.user_id)!)
          console.log("Using cached tags")
          return
        }
          */

        const getTags = async () => {
          setIsLoading(true);
          try {
            const response = await getTagsInfo(); 

            // Merge subscription status from user tags
            const subscribedTags = response.data.tags.map((tag: Tag) => {
              const userTagPivot = user.tags.find((t) => t.tag_id === tag.tag_id)?.pivot;
      
              return {
                ...tag,
                subscribed: !!userTagPivot?.is_active,   
                pending: !!userTagPivot?.is_pending,
              };
            });

            setTagList(subscribedTags);
            tagCache.set(user.user_id, subscribedTags)
          } catch (e) {
            console.error("Failed to fetch tags:", e);
          } finally {
            setIsLoading(false);
            setHasLoaded(true);
          }
        };
      
        getTags();
      }, [user]);
      

      const renderKeywords = useCallback((tag: Tag, maxDisplay: number = 3) => {
        const keywords = tag.keywords || [];
        const displayed = keywords.slice(0, maxDisplay);
        const remainingCount = keywords.length - displayed.length;
      
        return (
          <>
            {displayed.map((kw) => (
              <Badge key={kw.id} variant="outline" className="text-xs">
                {kw.content}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount} more
              </Badge>
            )}
          </>
        );
      }, [tagList]);
      
      

  return (
    isLoading ? (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    ) : (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light mb-2">News Categories</h2>
        <p className="text-muted-foreground">
          Manage your subscriptions and view keywords for each category
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tagList.map((tag) => (
          <Card key={tag.tag_id} className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-light">{tag.name}</CardTitle>
                <Switch checked={tag.subscribed} disabled={tag.pending} />

              </div>
              <CardDescription>{tag.keywords_count} keywords tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">{renderKeywords(tag, 5)}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openTagDetails(tag)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  View all keywords
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TagDetailsModal
        tag={selectedTag}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onToggleSubscription={toggleSubscription}
        user={user}
      />
    </div>

      )
  )
  
}

export default memo(TagList)
