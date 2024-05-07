import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import type { MediaType, ImagePickerResponse } from 'react-native-image-picker'
import { logging } from './logger'

export const handleImage: HandleImage = async (options, target) => {
  const launchOptions = {
    mediaType: options.type || 'photo',
    includeBase64: true,
    selectionLimit: options.limit,
  }
  try {
    let result = null
    if (target === 'camera') {
      result = await launchCamera(launchOptions)
    } else {
      result = await launchImageLibrary(launchOptions)
    }

    logging.info(result)
    return result.assets
  } catch (error) {
    logging.error(error)
  }
}

type HandleImage = (
  options: {
    limit?: number
    type?: MediaType
  },
  target?: 'camera' | 'gallery',
) => Promise<ImagePickerResponse['assets']>
