module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js', 'react-native-gesture-handler/jestSetup'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-config|react-native-image-picker|react-native-safe-area-context|react-native-gesture-handler|react-native-drawer-layout|react-native-vector-icons|react-native-reanimated|react-native-reanimated-carousel|react-native-size-matters|react-native-ratings|react-native-animatable|@rneui|react-native-paper|@shopify|@wuba|echarts|zrender|react-native-webview|react-native-fs|react-native-image-crop-picker|@sbaiahmed1/react-native-biometrics)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '^react-native-vector-icons$': '<rootDir>/__mocks__/vectorIconsMock.js',
    '^react-native-vector-icons/(.*)$':
      '<rootDir>/__mocks__/vectorIconsMock.js',
    '^~utils$': '<rootDir>/src/utils',
    '^~utils/(.*)$': '<rootDir>/src/utils/$1',
    '^~hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^~components/(.*)$': '<rootDir>/src/components/$1',
    '^~pages/(.*)$': '<rootDir>/src/pages/$1',
    '^~consts/(.*)$': '<rootDir>/src/consts/$1',
    '^~store/(.*)$': '<rootDir>/src/store/$1',
    '^~layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^~assets/(.*)$': '<rootDir>/src/assets/$1',
    '^~api/(.*)$': '<rootDir>/src/api/$1',
  },
}
