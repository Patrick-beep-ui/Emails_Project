"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, CheckCircle, XCircle, Clock } from "lucide-react"
import { Subscription } from "@/pages/Users"
import { approveSubscription } from "@/services/tagServices"

interface SubscriptionRequestsModalProps {
  isOpen: boolean
  onClose: () => void
  requests: Subscription[]
  onApprove: (requestId: number) => void
  onDecline: (requestId: number) => void
}

export function SubscriptionRequestsModal({
  isOpen,
  onClose,
  requests,
  onApprove,
  onDecline,
}: SubscriptionRequestsModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleApprove = async (userId: number, tagId: number) => {
    setIsLoading(true)
    await approveSubscription({
        user_id: userId,
        tag_id: tagId
    })
    setIsLoading(false)
  }

  const handleDecline = async (requestId: number) => {
    setIsLoading(true)
    await onDecline(requestId)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border/50 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-light">Subscription Requests</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {requests.length} pending {requests.length === 1 ? "request" : "requests"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">There are no pending subscription requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">
                              {request.first_name[0]}
                              {request.last_name[0]}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">
                              {request.first_name} {request.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">{request.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-muted-foreground">Requesting access to:</span>
                          <Badge variant="secondary" className="font-normal">
                            {request.name}
                          </Badge>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{request.created_at}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(request.id)}
                          disabled={isLoading}
                          className="bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>   
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.user_id, request.tag_id)}
                          disabled={isLoading}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Review and approve user subscription requests</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
