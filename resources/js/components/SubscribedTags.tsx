"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsIcon } from "lucide-react"

import { useState, useEffect } from "react"
import { getUserTags } from "@/services/tagServices"
import { User } from "@/contexts/auth-context"
import { Tag } from "./tags-list"

interface SubscribedTagsCardProps {
  tags: Tag[],
  user: User | null,
  toggleSubscription: (tagId: string) => void
  openTagDetails: (tag: Tag) => void
}

export function SubscribedTagsCard({ toggleSubscription, openTagDetails, user }: SubscribedTagsCardProps) {
    const [userTags, setUserTags] = useState<Tag[]>([]);

    if (!user) return null // or a message/loading spinner; 

    useEffect(() => {
        const fetchUserTags = async () => {
          try {
            const response = await getUserTags(user.user_id); 
            setUserTags(response.data.tags);
            console.log("Fetched user tags:", response.data.tags);
          } catch (e) {
            console.error("Failed to fetch user tags:", e);
          }
        };
      
        fetchUserTags();
      }, []);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-light">Your Subscriptions</CardTitle>
        <CardDescription>Manage your news category subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userTags.map((tag) => (
            <div
              key={tag.tag_id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/30"
            >
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-medium">{tag.name}</div>
                  <div className="text-sm text-muted-foreground">{tag.keywords_count} keywords</div>
                </div>
                {tag.subscribed && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openTagDetails(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                <Switch checked={tag.is_active} onCheckedChange={() => toggleSubscription(tag.tag_id)} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
