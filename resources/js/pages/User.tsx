import { useState, useEffect } from "react"
import { getUsers } from "../services/usersService"

// Define a type for your user object
interface UserType {
  id: number
  email: string
}

// Optionally, define the API response type
interface GetUsersResponse {
  users: UserType[]
}

export default function User() {
  const [users, setUsers] = useState<UserType[]>([])

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
    <div>
      <h1>Hello Cynthia from User</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            -{user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
