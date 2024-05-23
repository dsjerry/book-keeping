import { useRef, Fragment } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel'

interface Props {
  isShowDots?: boolean
  isAutoPlay?: boolean
  autoPlayInterval?: number
  children: React.ReactNode[]
}

const SwiperCard: React.FC<Props> = ({
  children,
  isAutoPlay,
  autoPlayInterval,
  isShowDots = true,
}) => {
  const ref = useRef<ICarouselInstance>(null)
  const progress = useSharedValue<number>(0)

  const width = Dimensions.get('window').width
  const dotCounts = [...new Array(children.length).keys()]

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        width={width}
        height={width / 2}
        ref={ref}
        data={children}
        autoPlay={isAutoPlay}
        autoPlayInterval={autoPlayInterval || 3000}
        onProgressChange={progress}
        renderItem={({ index, item: swiperItem }) => (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            {swiperItem ? (
              <Fragment key={index}>{swiperItem}</Fragment>
            ) : (
              <Text style={{ textAlign: 'center', fontSize: 30 }}>{index}</Text>
            )}
          </View>
        )}
      />

      {isShowDots && (
        <Pagination.Basic
          progress={progress}
          data={dotCounts}
          dotStyle={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 50 }}
          containerStyle={{ gap: 5, marginTop: 10 }}
          onPress={onPressPagination}
        />
      )}
    </View>
  )
}

export default SwiperCard
