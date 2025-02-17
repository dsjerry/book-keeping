module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '~utils': './src/utils',
          '~hooks': './src/hooks',
          '~components': './src/components',
          '~pages': './src/pages',
          '~consts': './src/consts',
          '~store': './src/store',
          '~layouts': './src/layouts',
          '~assets': './src/assets',
        },
      },
    ],
  ],
}
