import { useState } from 'react'
import axios from 'axios'

export const useFetch = (url: string, options: RequestOptions) => {
  const [isFetching, setIsFetching] = useState(false)

  const fetching = async () => {
    setIsFetching(true)
    try {
      const { data } = await axios(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return data
    } catch (error) {
      console.log(error)
    } finally {
      setIsFetching(false)
    }
  }

  return { fetching, isFetching }
}
