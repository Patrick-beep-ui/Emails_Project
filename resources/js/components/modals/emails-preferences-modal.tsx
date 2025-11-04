import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XIcon, PlusIcon, MailIcon, Loader2Icon } from "lucide-react"
import { addUserRecipients, getUserRecipients } from "@/services/recipients"
import { User } from "@/contexts/auth-context"

interface EmailPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

interface CcEmails {
    id: number,
    email_address: string,
    user_id: number,
    created_at: string,
    updated_at:string,
}

export function EmailPreferencesModal({ isOpen, onClose, user }: EmailPreferencesModalProps) {
  const [ccEmails, setCcEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCcEmails()
    }
  }, [isOpen])

  const loadCcEmails = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getUserRecipients(user?.user_id)
      const {data} = response
      console.log("recipients:",data.recipients)
      setCcEmails(data.recipients.map((r: CcEmails) => r.email_address))
    } catch (error) {
      console.error("Failed to load CC emails:", error)
      setCcEmails([])
    } finally {
      setIsLoading(false)
    }
  }, [ccEmails])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAddEmail = useCallback(() => {
    setEmailError("")

    if (!newEmail.trim()) {
      setEmailError("Please enter an email address")
      return
    }

    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address")
      return
    }

    if (ccEmails.includes(newEmail.toLowerCase())) {
      setEmailError("This email is already in your CC list")
      return
    }

    setCcEmails([...ccEmails, newEmail.toLowerCase()])
    setNewEmail("")
  }, [emailError, newEmail, ccEmails])

  const handleRemoveEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((email) => email !== emailToRemove))
  }

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
        const data = {
            user_id: user?.user_id,
            recipients: ccEmails.map(email => ({ email_address: email }))
        }

        await addUserRecipients(data)

        await new Promise((resolve) => setTimeout(resolve, 800))

        console.log("Saved CC emails:", ccEmails)
        onClose()
    } catch (error: any) {
        console.error("Failed to save CC emails:", error)
        // backend validation errors
        if (error.response?.data?.errors) {
          setEmailError(Object.values(error.response.data.errors).flat().join(", "))
        } else {
          setEmailError("Failed to save preferences. Please try again.")
        }
    } finally {
      setIsSaving(false)
    }
  }, [ccEmails])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddEmail()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card shadow-xl">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <MailIcon className="h-5 w-5 text-primary" />
                Email Preferences
              </CardTitle>
              <CardDescription>Add email addresses to receive copies of your news digests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Add Email Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Add CC Recipients</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value)
                      setEmailError("")
                    }}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-background border-border/50"
                  />
                  <Button onClick={handleAddEmail} size="sm">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              </div>

              {/* Current CC List */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Current CC Recipients ({ccEmails.length})</label>
                {ccEmails.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ccEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20"
                      >
                        <div className="flex items-center gap-2">
                          <MailIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(email)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MailIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No CC recipients added yet</p>
                    <p className="text-xs mt-1">Add email addresses to share your news digests</p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> All email addresses added here will receive a copy
                  of your news digest emails. They will see the same articles based on your subscription preferences.
                </p>
              </div>
            </>
          )}
        </CardContent>

        <div className="border-t border-border/50 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
