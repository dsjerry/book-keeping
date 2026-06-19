import { useState } from 'react'
import axios from 'axios'
import { logging } from '~utils'

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
      logging.error('[useFetch]', error)
    } finally {
      setIsFetching(false)
    }
  }

  return { fetching, isFetching }
}
