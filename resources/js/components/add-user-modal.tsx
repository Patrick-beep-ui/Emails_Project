"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserPlusIcon } from "lucide-react"
import AddUserForm from "./add-user-form"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onAddUser?: () => void
}

export function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const handleSuccess = () => {
    if (onAddUser) onAddUser()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-light flex items-center gap-2">
            <UserPlusIcon className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>Create a new user account with their basic information</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <AddUserForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
