"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SearchIcon, FilterIcon, XIcon } from "lucide-react"

interface NewsFiltersProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  onClearFilters: () => void
}

const availableTags = ["Technology", "Business", "Science", "Sports", "Politics"]

export function NewsFilters({
  selectedTags,
  onTagToggle,
  searchTerm,
  onSearchChange,
  onClearFilters,
}: NewsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-input border-border/50"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="shrink-0">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          {(selectedTags.length > 0 || searchTerm) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                  <button onClick={() => onSearchChange("")} className="ml-1 hover:text-destructive">
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button onClick={() => onTagToggle(tag)} className="ml-1 hover:text-destructive">
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs h-6">
                Clear all
              </Button>
            </div>
          )}

          {/* Filter Options */}
          {showFilters && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div>
                <h4 className="text-sm font-medium mb-2">Filter by category:</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => onTagToggle(tag)}
                      className="text-xs"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
