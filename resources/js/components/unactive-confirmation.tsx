"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangleIcon, XIcon } from "lucide-react"

interface UnsubscribeConfirmationModalProps {
  isOpen: boolean
  tagName: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeactiveConfirmationModal({
  isOpen,
  tagName,
  onConfirm,
  onCancel,
}: UnsubscribeConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 border-border/50 shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg font-light">Deactivate {tagName}?</CardTitle>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 -mr-2 -mt-2">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            You will stop receiving news articles related to this category. You can activate at any time.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onCancel} className="bg-transparent">
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Deactivate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
