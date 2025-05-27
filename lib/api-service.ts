const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface UserResponse {
  id: string
  name: string
  email: string
  picture: string
  plan: 'free' | 'premium'
  createdAt: string
}

export const userService = {
  async doLogin(idToken: string): Promise<UserResponse> {
    try {
      console.log('Attempting to login with backend at:', `${API_BASE_URL}/users/login`)
      
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_token: idToken
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend response error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        })
        throw new Error(`Failed to login user: ${response.status} ${response.statusText}`)
      }

      const userData = await response.json()
      console.log('User data received from backend:', userData)

      return userData
    } catch (error) {
      console.error('Error in login process:', error)
      throw error
    }
  }
} 