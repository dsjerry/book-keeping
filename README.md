# TODO

## 首版

1. [ ] 统一颜色 (基于`react-native-paper`)

2. [x] 首页过滤

3. [ ] 让基本功能稳定可用

4. [ ] 添加后端同步

5. [ ] 管理白天/夜间模式 (基于`react-native-paper`)

6. [ ] 添加颜色点缀

7. [ ] 添加一些类似于轮播图的首页交互

8. [ ] 首次签名打包

# 优化

1. [ ] 路由导航添加 TS 类型注释

2. [ ] 添加一条新的记录之后应该执行一次排序

3. [ ] 标签应该从当前用户中读取，创建用户的时候赋予默认标签

4. [ ] 添加图片的时候，需要有个图片裁剪的功能

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
