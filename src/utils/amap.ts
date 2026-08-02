import axios from 'axios'
import Config from 'react-native-config'
import { logging } from './logger'
import { wgs84ToGcj02 } from './geo'

type Coords = { latitude: number; longitude: number }
class Amap {
  private baseUrl = 'https://restapi.amap.com/v3'
  private key = Config.AMAP_API_KEY
  private coords: Coords
  constructor(coords: Coords) {
    // 高德使用 GCJ02 坐标系，而 GPS 返回的是 WGS84，默认转成 GCJ02 再请求，
    // 可通过环境变量 COORD_SYSTEM=wgs84 关闭转换（原样请求，注意会有偏差）
    const coordSystem = (Config.COORD_SYSTEM || 'gcj02').toLowerCase()
    this.coords = coordSystem === 'wgs84' ? coords : wgs84ToGcj02(coords.latitude, coords.longitude)
  }

  async regeo() {
    let url = `${this.baseUrl}/geocode/regeo?location=${this.coords.longitude},${this.coords.latitude}&key=${this.key}&output=json&extensions=all`
    try {
      const { data } = await axios.get(url)
      // 高德业务错误：status !== '1'（如 key 被回收、配额超限、参数非法）
      if (data?.status !== '1') {
        logging.error('[Amap] regeo 业务失败:', data?.info)
        return null
      }
      return data
    } catch (error) {
      logging.error('[Amap] regeo 失败:', error)
      return null
    }
  }
}

export { Amap }
