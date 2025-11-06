"use client";

import { useState, useEffect, useCallback } from "react";

export interface TempTagState {
  tag_id: string;
  is_active: boolean;
}

const STORAGE_KEY = import.meta.env.VITE_TAG_STORAGE_KEY || "temp_tag_states";

// Retrieve all tag states from localStorage
function getStoredTagStates(): TempTagState[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save all tag states to localStorage
function saveTagStates(states: TempTagState[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

export function useTempTagState() {
  const [tagStates, setTagStates] = useState<TempTagState[]>(() => getStoredTagStates());

  // Sync with other components when localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setTagStates(getStoredTagStates());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Update a tag state
  const setTagState = useCallback((tag_id: string, is_active: boolean) => {
    setTagStates(prev => {
      const updated = [...prev.filter(t => t.tag_id !== tag_id), { tag_id, is_active }];
      saveTagStates(updated);
      return updated;
    });
  }, []);

  // Get current tag state
  const getTagState = useCallback(
    (tag_id: string) => tagStates.find(t => t.tag_id === tag_id)?.is_active ?? null,
    [tagStates]
  );

  const clearTagStates = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTagStates([]);
  }, []);

  // Clear on reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { tagStates, setTagState, getTagState, clearTagStates };
}
