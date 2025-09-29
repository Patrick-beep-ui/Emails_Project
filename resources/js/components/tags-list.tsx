"use client"

import { FC } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsIcon, Tag } from "lucide-react"
import { TagDetailsModal } from "./tag-details-modal"


import { useState, useEffect, useCallback } from "react"
import { getTagsInfo } from "@/services/tagServices"

export interface Keyword {
    id: string
    content: string
  }
  
  export interface Tag {
    tag_id: string
    name: string
    description: string
    subscribed: boolean
    keywords_count?: number
    keywords?: Keyword[]
    is_active?: boolean
    is_pending?: boolean
  }
  

interface TagListProps {
  toggleSubscription: (id: string) => void
}

export const TagList: FC<TagListProps> = ({ toggleSubscription }) => {
    const [tagList, setTagList] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false)

      const openTagDetails = useCallback((tag: Tag) => {
        setSelectedTag(tag)
        setIsTagModalOpen(true)
      },[selectedTag, isTagModalOpen])

    useEffect(() => {
        const getTags = async () => {
          try {
            const response = await getTagsInfo(); 
            setTagList(response.data.tags);
            console.log("Fetched tags:", response.data.tags);
          } catch (e) {
            console.error("Failed to fetch tags:", e);
          }
        };
      
        getTags();
      }, []);
      

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
                <Switch checked={tag.subscribed} onCheckedChange={() => toggleSubscription(tag.tag_id)} />
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
      />
    </div>

    
  )
  
}
