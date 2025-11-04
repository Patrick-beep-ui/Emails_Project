import { useState, useCallback, useMemo } from "react"
import axios from "axios"

export default function SetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("token")
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (password.trim().length < 8) {
      alert("Password must be at least 8 characters long.")
      return
    }
    if (password !== confirmPassword) return alert("Passwords do not match")
    setLoading(true)
    try {
      await axios.post("/api/users/set-password", { token, password })
      alert("Password set successfully!")
      window.location.href = "/" // redirect to login
    } catch (err) {
      alert("Invalid or expired link")
    } finally {
      setLoading(false)
    }
  }, [password, confirmPassword, token])

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow">
      <h2 className="text-xl mb-4">Set Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          className="border p-2 w-full mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          className="border p-2 w-full mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          {loading ? "Setting..." : "Set Password"}
        </button>
      </form>
    </div>
  )
}
