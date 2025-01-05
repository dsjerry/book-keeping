import axios from 'axios'

type Coords = { latitude: number; longitude: number }
class Amap {
  private baseUrl = 'https://restapi.amap.com/v3'
  private key = '71f4c84274ea1cba2c8b35ccfdfd7bdd'
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
      console.log(error)
    }
  }
}

export { Amap }
