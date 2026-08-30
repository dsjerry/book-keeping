/**
 * Jest 全局配置：React Native 原生模块的 mock
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
)

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
)

jest.mock('react-native-linear-gradient', () => 'LinearGradient')

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react')
  const { View } = require('react-native')
  const MockComponent = props => React.createElement(View, props)
  return new Proxy(
    {},
    {
      get: () => MockComponent,
    },
  )
})

// echarts 的 RN 桥接层直接 mock，避免在 Jest 中加载 skia/zrender
jest.mock('@wuba/react-native-echarts', () => {
  const React = require('react')
  const { View } = require('react-native')
  const Chart = React.forwardRef((props, ref) =>
    React.createElement(View, { ref }),
  )
  return {
    SVGRenderer: { install: jest.fn() },
    SvgChart: Chart,
    SkiaChart: Chart,
  }
})

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    setRNConfiguration: jest.fn(),
    getCurrentPosition: jest.fn(success =>
      success({ coords: { latitude: 31.2304, longitude: 121.4737 } }),
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}))

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}))

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(),
  openCamera: jest.fn(),
}))

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker')

jest.mock('react-native-svg', () => {
  const React = require('react')
  const { View } = require('react-native')
  return new Proxy(
    {},
    {
      get: () => props => React.createElement(View, props),
    },
  )
})

jest.mock('react-native-screens', () => {
  const React = require('react')
  const { View } = require('react-native')
  const MockComponent = props => React.createElement(View, props)
  return new Proxy(
    { enableScreens: jest.fn(), enableFreeze: jest.fn() },
    {
      get: (target, key) => target[key] || MockComponent,
    },
  )
})

jest.mock('react-native-wheely', () => {
  const React = require('react')
  const { View } = require('react-native')
  const MockWheely = props => React.createElement(View, props)
  module.exports = MockWheely
  module.exports.default = MockWheely
  return MockWheely
})

jest.mock('@react-native-masked-view/masked-view', () => {
  const React = require('react')
  const { View } = require('react-native')
  const MockMaskedView = props => React.createElement(View, props)
  module.exports = MockMaskedView
  module.exports.default = MockMaskedView
  return MockMaskedView
})

jest.mock('@react-native-menu/menu', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    MenuView: props => React.createElement(View, props),
    MenuAction: props => React.createElement(View, props),
  }
})

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn(), openImageFile: jest.fn() },
}))

jest.mock('react-native-view-shot', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) =>
      React.createElement(View, { ...props, ref }),
    ),
    captureRef: jest.fn(() => Promise.resolve('file://mock.png')),
  }
})

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: false })),
  simplePrompt: jest.fn(() => Promise.resolve({ success: false })),
}))

// virtual: amap3d 已从依赖中移除（地图改用 WebView 实现），保留 mock 以防旧代码/快照引用时 Jest 崩溃
jest.mock(
  'react-native-amap3d',
  () => {
    const React = require('react')
    const { View } = require('react-native')
    return {
      AMapSdk: { init: jest.fn(), setKey: jest.fn() },
      MapView: props => React.createElement(View, props),
      MapType: { Standard: 1, Satellite: 2 },
    }
  },
  { virtual: true },
)

// WebView 依赖原生 TurboModule（RNCWebViewModule），Jest 环境没有原生层，用 View 代替渲染
jest.mock('react-native-webview', () => {
  const React = require('react')
  const { View } = require('react-native')
  const WebView = props => React.createElement(View, props)
  return { __esModule: true, default: WebView, WebView }
})

// react-native-fs 在 import 时就会创建 NativeEventEmitter（需要原生层），整体 mock 掉
jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    readFile: jest.fn(() => Promise.resolve('')),
    exists: jest.fn(() => Promise.resolve(false)),
    readDir: jest.fn(() => Promise.resolve([])),
    DocumentDirectoryPath: '/mock/documents',
    CachesDirectoryPath: '/mock/caches',
  },
}))

// document-picker 同样依赖原生 TurboModule（RNDocumentPicker）
jest.mock('react-native-document-picker', () => ({
  __esModule: true,
  default: {
    pick: jest.fn(() => Promise.resolve([])),
    pickSingle: jest.fn(() => Promise.resolve({})),
    isSupported: jest.fn(() => Promise.resolve(true)),
    types: { allFiles: 'public.item', zip: 'public.zip-archive' },
  },
}))
