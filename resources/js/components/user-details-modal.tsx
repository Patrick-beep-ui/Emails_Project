"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { TrashIcon, SaveIcon } from "lucide-react"
import { updateUser, deleteUser } from "@/services/usersService"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any | null
  onUserUpdated?: () => void
  onUserDeleted?: () => void
}

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onUserDeleted,
}: UserDetailsModalProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Load user info when modal opens
  useEffect(() => {
    if (user) reset(user)
  }, [user, reset])

  const handleUpdate = async (data: any) => {
    try {
      await updateUser(user.user_id, data)
      if (onUserUpdated) onUserUpdated()
      onClose()
    } catch (error) {
      console.error(error)
      alert("Error updating user")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(user.user_id)
      if (onUserDeleted) onUserDeleted()
      onClose()
    } catch (error) {
      console.error(error)
      alert("Error deleting user")
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">User Details</DialogTitle>
          <DialogDescription>Edit or remove this user account</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">First Name</label>
              <Input {...register("first_name", { required: true })} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">Last Name</label>
              <Input {...register("last_name", { required: true })} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <Input type="email" {...register("email", { required: true })} />
          </div>

          <div className={`flex justify-between pt-4 border-t border-border/50 ${isDeleteOpen ? "flex-col gap-4" : ""}`}>
            {/* Delete Section */}
            {isDeleteOpen ? (
              <div className="p-4 border rounded-md bg-red-50 flex flex-col gap-2 w-full ">
                <p className="text-red-600 font-medium">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </Button>
            )}

            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <SaveIcon className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
