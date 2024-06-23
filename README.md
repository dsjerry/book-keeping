# TODO

## 首版

1. [ ] 统一颜色 (基于`react-native-paper`)

2. [x] 首页过滤

3. [x] 让基本功能稳定可用

4. [ ] 添加后端同步

5. [ ] 管理白天/夜间模式 (基于`react-native-paper`)

6. [ ] 添加颜色点缀

7. [ ] 添加一些类似于轮播图的首页交互

8. [ ] 首次签名打包

# 优化

1. [ ] 路由导航添加 TS 类型注释

2. [x] 添加一条新的记录之后应该执行一次排序

3. [x] 标签应该从当前用户中读取，创建用户的时候赋予默认标签

4. [x] 添加图片的时候，需要有个图片裁剪的功能

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

### 获取

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

### 裁剪

> 这个裁剪的依赖也有选择图片的功能

```shell
yarn add react-native-image-crop-picker
```

## 本地存储

> 相当于 react native 的 localStorage，使用 zustand 等作为状态管理的时候，数据持久化可以指定为这个依赖

```shell
yarn add @react-native-async-storage/async-storage
```

## 地理位置

> 获取到经纬度等信息，项目使用它和高德地图 api 来获取位置详细信息

```shell
yarn add @react-native-community/geolocation
```

# 其他

1. 相比于 Cordova 少了很多系统层面的 API，Cordova 更像是 Electron

2. 界面和动画层面像原生应用
