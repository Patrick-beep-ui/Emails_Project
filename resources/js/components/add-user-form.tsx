"use client"

import { useForm } from "react-hook-form"
import { addUser } from "@/services/usersService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlusIcon } from "lucide-react"
import { useEffect, useState, useCallback, memo } from "react"
import { getTags } from "@/services/tagServices"

interface AddUserFormProps {
  onSuccess?: () => void
}

interface Tags {
  tag_id: number
  name: string
}

function AddUserForm({ onSuccess }: AddUserFormProps) {
  const [availableTags, setAvailableTags] = useState<Tags[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({ mode: "onChange" })

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getTags()
        setAvailableTags(response.data.tags || [])
      } catch (error) {
        console.error("Error fetching tags:", error)
      }
    }

    fetchTags()
  }, [])

  const processData = useCallback(async (data: any) => {
    try {
      const response = await addUser(data)
      console.log(response)
      reset() // Reset form on success
      if (onSuccess) onSuccess()
    } catch (error: any) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors
        // map each field error into RHF
        Object.entries(serverErrors).forEach(([field, messages]: [string, any]) => {
          setError(field, {
            type: "server",
            message: messages[0], // Laravel always sends an array
          })
        })
      } else {
        console.error(error)
      }
    }
  }, [onSuccess, reset, setError])

  return (
    <form onSubmit={handleSubmit(processData)} className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">User Information</CardTitle>
          <CardDescription className="text-sm">Basic details for the new user account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium text-foreground/80">
                First Name
              </label>
              <Input
                id="first_name"
                type="text"
                placeholder="John"
                className="bg-input border-border/50"
                {...register("first_name", {
                  required: "First name is required",
                })}
              />
              {errors.first_name && (
                <span className="text-sm text-destructive">{errors.first_name.message as string}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium text-foreground/80">
                Last Name
              </label>
              <Input
                id="last_name"
                type="text"
                placeholder="Doe"
                className="bg-input border-border/50"
                {...register("last_name", {
                  required: "Last name is required",
                })}
              />
              {errors.last_name && (
                <span className="text-sm text-destructive">{errors.last_name.message as string}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground/80">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              className="bg-input border-border/50"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && <span className="text-sm text-destructive">{errors.email.message as string}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <label key={tag.tag_id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={tag.tag_id}
                    {...register("tags")}
                    className="accent-primary"
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            "Creating..."
          ) : (
            <>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Create User
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default memo(AddUserForm)