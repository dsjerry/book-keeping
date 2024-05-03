import { launchImageLibrary } from 'react-native-image-picker'
import type { MediaType } from 'react-native-image-picker'
import { logging } from './logger'

interface Options {
  limit?: number
  type?: MediaType
}

export const handleImage = async (options: Options) => {
  try {
    const result = await launchImageLibrary({
      mediaType: options.type || 'photo',
      includeBase64: true,
      selectionLimit: options.limit,
    })

    logging.info(result)
    return result.assets
  } catch (error) {
    logging.error(error)
  }
}
