"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getTagsInfo, getUserTags, toggleTagStatus, requestSubscription } from "@/services/tagServices"
import type { Tag } from "@/components/tags-list"
import type { User } from "@/contexts/auth-context"

interface TagsContextType {
  tags: Tag[]
  loading: boolean
  refreshTags: (userId: string) => Promise<void>
  toggleTagActive: (userId: string, tagId: string, isActive: boolean) => Promise<void>
  requestTagSubscription: (userId: string, tagId: string) => Promise<void>
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
}

const TagsContext = createContext<TagsContextType | undefined>(undefined)

export function TagsProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)

  const refreshTags = useCallback(async (userId: string) => {
    if (!userId) return
    setLoading(true)
    try {
      const [allTagsRes, userTagsRes] = await Promise.all([
        getTagsInfo(),
        getUserTags(userId),
      ])

      const userTags = userTagsRes.data.tags
      const merged = allTagsRes.data.tags.map((tag: Tag) => {
        const userPivot = userTags.find((t: Tag) => t.tag_id === tag.tag_id)?.pivot
        return {
          ...tag,
          subscribed: !!userPivot?.is_active,
          pending: !!userPivot?.is_pending,
          deactivated: userPivot ? !userPivot.is_active && !userPivot.is_pending : false,
        }
      })

      setTags(merged)
    } catch (err) {
      console.error("Failed to refresh tags:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleTagActive = useCallback(async (userId: string, tagId: string, isActive: boolean) => {
    try {
      await toggleTagStatus({ user_id: userId, tag_id: tagId, is_active: isActive })
      setTags(prev =>
        prev.map(tag =>
          tag.tag_id === tagId
            ? { ...tag, subscribed: isActive, deactivated: !isActive, pending: false }
            : tag
        )
      )
    } catch (err) {
      console.error("Failed to toggle tag:", err)
    }
  }, [])

  const requestTagSubscription = useCallback(async (userId: string, tagId: string) => {
    try {
      await requestSubscription({ user_id: userId, tag_id: tagId })
      setTags(prev =>
        prev.map(tag =>
          tag.tag_id === tagId ? { ...tag, pending: true } : tag
        )
      )
    } catch (err) {
      console.error("Failed to request subscription:", err)
    }
  }, [])

  useEffect(() => {
    if (user) refreshTags(user.user_id)
  }, [user])

  return (
    <TagsContext.Provider value={{ tags, loading, refreshTags, toggleTagActive, requestTagSubscription, setTags }}>
      {children}
    </TagsContext.Provider>
  )
}

export function useTags() {
  const context = useContext(TagsContext)
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider")
  }
  return context
}
