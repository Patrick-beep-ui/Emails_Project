"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { getTagsInfo, getUserTags, toggleTagStatus, requestSubscription } from "@/services/tagServices"
import type { Tag } from "@/components/tags-list"
import type { User } from "@/contexts/auth-context"

interface TagsContextType {
  tags: Tag[]
  userTags: Tag[]
  isLoading: boolean
  refreshTags: () => Promise<void>
  refreshUserTags: (userId: number) => Promise<void>
  toggleTag: (userId: number, tagId: string, isActive: boolean) => Promise<void>
  requestTagSubscription: (userId: number, tagId: string) => Promise<void>
}

const TagsContext = createContext<TagsContextType | undefined>(undefined)

export const TagsProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([])
  const [userTags, setUserTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /* Load all available tags */
  const refreshTags = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getTagsInfo()
      setTags(response.data.tags)
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* Load tags linked to a specific user */
  const refreshUserTags = useCallback(async (userId: number) => {
    try {
      setIsLoading(true)
      const response = await getUserTags(userId)
      setUserTags(response.data.tags)
    } catch (error) {
      console.error("Failed to fetch user tags:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* Toggle subscription on/off */
  const toggleTag = useCallback(async (userId: number, tagId: string, isActive: boolean) => {
    try {
      await toggleTagStatus({ user_id: userId, tag_id: tagId, is_active: isActive })
      await refreshUserTags(userId)
    } catch (error) {
      console.error("Failed to toggle tag:", error)
    }
  }, [refreshUserTags])

  /* Request a subscription (pending state) */
  const requestTagSubscription = useCallback(async (userId: number, tagId: string) => {
    try {
      await requestSubscription({ user_id: userId, tag_id: tagId })
      await refreshUserTags(userId)
    } catch (error) {
      console.error("Failed to request subscription:", error)
    }
  }, [refreshUserTags])

  // Load all tags initially
  useEffect(() => {
    refreshTags()
  }, [refreshTags])

  return (
    <TagsContext.Provider
      value={{
        tags,
        userTags,
        isLoading,
        refreshTags,
        refreshUserTags,
        toggleTag,
        requestTagSubscription,
      }}
    >
      {children}
    </TagsContext.Provider>
  )
}

/* Custom hook for using the context easily */
export const useTags = () => {
  const context = useContext(TagsContext)
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider")
  }
  return context
}
