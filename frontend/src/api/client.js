import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const client = axios.create({ baseURL })

// Attach the JWT access token (if present) to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize error messages from the backend's {error: {detail, status_code}} envelope.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.error?.detail
    let message = 'Something went wrong. Please try again.'

    if (typeof detail === 'string') {
      message = detail
    } else if (detail && typeof detail === 'object') {
      // DRF field errors look like { field: ["msg", ...], ... }
      const firstKey = Object.keys(detail)[0]
      const firstVal = detail[firstKey]
      message = Array.isArray(firstVal) ? firstVal[0] : String(firstVal)
    }

    return Promise.reject(new Error(message))
  },
)

export default client
