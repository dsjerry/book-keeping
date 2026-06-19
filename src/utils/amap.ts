import axios from 'axios'
import Config from 'react-native-config'
import { logging } from './logger'

type Coords = { latitude: number; longitude: number }
class Amap {
  private baseUrl = 'https://restapi.amap.com/v3'
  private key = Config.AMAP_API_KEY
  private coords: Coords
  constructor(coords: Coords) {
    this.coords = coords
  }

  async regeo() {
    let url = `${this.baseUrl}/geocode/regeo?location=${this.coords.longitude},${this.coords.latitude}&key=${this.key}&output=json&extensions=all`
    try {
      const { data } = await axios.get(url)
      return data
    } catch (error) {
      logging.error('[Amap] regeo 失败:', error)
    }
  }
}

export { Amap }
