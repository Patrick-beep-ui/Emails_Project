import { useState, useEffect } from "react"
import { getUsers } from "../services/usersService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TagsIcon, NewspaperIcon, KeyIcon, LogOutIcon, UserIcon, SettingsIcon, UsersIcon, UserPlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddUserModal } from "@/components/add-user-modal"

// Define a type for your user object
interface UserType {
  user_id: number
  first_name: string
  last_name: string
  email: string
  tags: Subscription[]
}

interface Subscription {
  tag_id: number
  name: string
  status: string
} 

// Optionally, define the API response type
interface GetUsersResponse {
  users: UserType[]
}

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)

  const handleUserAdded = () => {
    console.log("User added successfully, refreshing list...")
  }

  useEffect(() => {
    const getUsersData = async () => {
      try {
        const response = await getUsers()
        const data: GetUsersResponse = response.data
        setUsers(data.users)
        console.log(data.users)
      } catch (e) {
        console.error(e)
      }
    }

    getUsersData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light mb-2">System Users</h2>
          <p className="text-muted-foreground">Manage all users and their subscription status</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <UsersIcon className="h-4 w-4" />
          <span>{users.length} total users</span>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50">
                <tr className="bg-muted/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.user_id}
                    className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                    index === users.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </td>
                    <td className="p-4">
                      { 
                        <div className="flex flex-wrap gap-1">
                          {user.tags.length > 0 ? (
                            user.tags.map((tag) => (
                              <Badge key={tag.tag_id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))
                            ) : (
                              <span className="text-sm text-muted-foreground italic">No subscriptions</span>
                            )}
                        </div>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Button onClick={() => setIsAddUserModalOpen(true)} size="sm">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add User
            </Button>
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleUserAdded}
    />
    </div>
  )
}
