import axios from 'axios'

export const doRequest = async (url: string, opt: RequestOptions) => {
  try {
    const { data } = await axios(url, {
      method: opt.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(data)
  } catch (error) {
    console.log(error)
  }
}
