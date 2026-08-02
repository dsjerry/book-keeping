# BookKeeping

学习 React Native 的一个项目（不严谨），模拟记账本的基本功能

使用脚手架搭建，主要用到的库：

- 界面

  - 组件库：react-native-paper
  - 图表：@wuba/react-native-echarts
  - 图标：react-native-vector-icons

- 存储

  - 状态管理：zustand
  - 持久化：async-storage

- LLM 调用：ai、@ai-sdk/deepseek

## 开发和打包

使用 yarn 安装依赖

```shell
yarn install
```

运行项目，使用 Android Studio 的手机模拟器 或 直接使用手机连接电脑打开 USB 调试

```shell
yarn start
```

打包测试包（apk）

```shell
cd android

./gradlew assembleRelease
```

- [打包教程](https://reactnative.cn/docs/signed-apk-android)

## 开发注意事项

- [开发约定与踩坑](docs/notes.md) —— 设计语言、环境变量、性能、Android 原生等约定
- [Bug 记录与修复](docs/bugs.md) —— 已解决的 bug 与排查思路

常见问题速查：

- 改 `.env` 后看不到效果？→ 环境变量是构建期注入，需重新构建；且改样式后先 `yarn start --reset-cache` 清 Metro 缓存
- 颜色拼接崩 `rgba(..., 1)1A`？→ MD3 主题色是 rgba 格式，透明度必须用 `withAlpha`，禁止 `theme.colors.X + 'XX'`
- 裁剪图片内容顶到状态栏？→ Android 15 edge-to-edge，见 `docs/bugs.md` #2

## 预览

<div>
<img src="https://s21.ax1x.com/2025/01/05/pE9E9j1.jpg" alt="首页-空" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EpcR.jpg" alt="首页-列表" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EPnx.jpg" alt="编辑" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EFHK.jpg" alt="详情" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EiB6.jpg" alt="分析" width="200" />
<img src="https://s21.ax1x.com/2025/05/12/pEXkxzj.jpg" alt="首页-暗色" width="200" />
<img src="https://s21.ax1x.com/2025/05/12/pEXASQs.jpg" alt="AI分析-暗色" width="200" />
</div>

## 数据同步流程

1. 首次同步：

   - 调用`sync`同步方法发送本地变更
   - 服务端处理并且返回结果
   - 更新本地数据状态（同步、新增、修改、删除）

2. 处理冲突：
   - 如果有冲突的数据，客户端显示冲突信息并且展示解决方式（客户端、服务端、合并）
   - 使用`resolveConflicts`生成解决方案
   - 再次调用`sync(resolutions)`同步方法将数据发给服务端
   - 服务端处理并且返回结果
   - 更新本地数据状态（同步、新增、修改、删除）
