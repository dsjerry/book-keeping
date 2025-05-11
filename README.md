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

# 开发和打包

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

# 预览

<div>
<img src="https://s21.ax1x.com/2025/01/05/pE9E9j1.jpg" alt="首页-空" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EpcR.jpg" alt="首页-列表" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EPnx.jpg" alt="编辑" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EFHK.jpg" alt="详情" width="200" />
<img src="https://s21.ax1x.com/2025/01/05/pE9EiB6.jpg" alt="分析" width="200" />
<img src="https://s21.ax1x.com/2025/05/12/pEXkxzj.jpg" alt="首页-暗色" width="200" />
<img src="https://s21.ax1x.com/2025/05/12/pEXASQs.jpg" alt="AI分析-暗色" width="200" />
</div>
