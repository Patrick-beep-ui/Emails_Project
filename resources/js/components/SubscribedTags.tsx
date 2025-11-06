"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsIcon, Loader2 } from "lucide-react"

import { useState, useEffect, useCallback } from "react"
import { getUserTags, toggleTagStatus } from "@/services/tagServices"
import { User } from "@/contexts/auth-context"
import { Tag } from "./tags-list"
import { DeactiveConfirmationModal } from "./confirmations/unactive-confirmation"
import { useTempTagState } from "@/hooks/useTempTagState";

interface TagProps extends Tag {
  is_active: boolean
  is_pending: boolean
}

interface SubscribedTagsCardProps {
  tags?: TagProps[]
  user: User | null
  openTagDetails: (tag: Tag) => void
}

export function SubscribedTagsCard({ openTagDetails, user }: SubscribedTagsCardProps) {
  const [userTags, setUserTags] = useState<TagProps[]>([])
  const [isDeactiveModalOpen, setIsDeactiveModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagProps | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setTagState } = useTempTagState();

  if (!user) return null // or a message/loading spinner;

  useEffect(() => {
    const fetchUserTags = async () => {
      setIsLoading(true);
      try {
        const response = await getUserTags(user.user_id)
        setUserTags((response.data.tags).filter((tag: TagProps) => !tag.is_pending))
        console.log("Fetched user tags:", response.data.tags)
      } catch (e) {
        console.error("Failed to fetch user tags:", e)
      }
      finally {
        setIsLoading(false);
      }
    }

    fetchUserTags()
  }, [user])

  const handleToggle = useCallback(
    async (tag: TagProps, nextState: boolean) => {
      if (!user) return

      if (nextState === false) {
        // ask confirmation before deactivation
        setSelectedTag(tag)
        setIsDeactiveModalOpen(true)
      } else {
        // activate immediately
        try {
          await toggleTagStatus({ user_id: user.user_id, tag_id: tag.tag_id, is_active: true })
          setUserTags((prev) =>
            prev.map((t) => (t.tag_id === tag.tag_id ? { ...t, is_active: true } : t))
          )
          setTagState(tag.tag_id, true); // reflect activated
        } catch (e) {
          console.error("Failed to activate tag:", e)
        }
      }
    },
    [user]
  )

  const confirmDeactivation = useCallback(async () => {
    if (!selectedTag || !user) return
    try {
      await toggleTagStatus({ user_id: user.user_id, tag_id: selectedTag.tag_id, is_active: false })
      setUserTags((prev) =>
        prev.map((t) => (t.tag_id === selectedTag.tag_id ? { ...t, is_active: false } : t))
      )
      setTagState(selectedTag.tag_id, false); // reflect deactivated
    } catch (e) {
      console.error("Failed to deactivate tag:", e)
    } finally {
      setIsDeactiveModalOpen(false)
      setSelectedTag(null)
    }
  }, [selectedTag, user])

  return (
    isLoading ? (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    ) : (
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
                {tag.is_active ? (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                ) : (
                  null
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
                <Switch
                  checked={tag.is_active}
                  onCheckedChange={(checked) => handleToggle(tag, checked)}
                />
              </div>
            </div>
          ))}
        </div>

        <DeactiveConfirmationModal
          isOpen={isDeactiveModalOpen}
          tagName={selectedTag?.name ?? ""}
          onConfirm={confirmDeactivation}
          onCancel={() => setIsDeactiveModalOpen(false)}
        />
      </CardContent>
    </Card>
    )
  )
}
