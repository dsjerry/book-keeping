# TODO

1. [ ] 统一颜色

2. [ ] 首页过滤

# 问题

1. [ ] navigation 导航的时候导航参数要断言为 never（所有在导航器注册的页面都可以导航）(添加参数类型)

# 依赖

## 渐变色

启用渐变色与 web 端不同，需要安装另外依赖

```shell
yarn add react-native-linear-gradient
```

## 路径别名

需要另外安装依赖

```shell
yarn add babel-plugin-module-resolver
```

然后在 babel 配置的 plugins 数组中添加别名配置，也需要在 `tsconfig.json` 中配置对应路径

```js
;[
  'module-resolver',
  {
    root: ['./src'],
    alias: {
      pages: './src/pages',
    },
  },
]
```

## 本地图片

安卓开启权限，修改`android/app/src/main/AndroidManifest.xml`，在`<manifest>`标签内添加：

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

需要额外安装依赖：

```shell
yarn add react-native-image-picker
```

使用：

```ts
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'

const handleImage = async () => {
  const result = await launchImageLibrary()
}
```
